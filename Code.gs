/**
 * Achievers Room Finder — Google Apps Script backend
 *
 * Deploy as Web App (Execute as: Me, Who has access: Anyone).
 * Endpoints:
 *   ?mode=board&day=today|tomorrow&key=STAFF_KEY
 *   ?mode=availability&date=yyyy-MM-dd&start=HH:mm&end=HH:mm&key=STAFF_KEY&token=...
 *   POST { action:"loginAvailability", key, password } → { token }
 *   ?mode=search&name=...&role=...&day=today|tomorrow&key=STAFF_KEY|TUTOR_KEY
 *
 * Public (no key): student role only, no lesson titles.
 * Tutor key: tutor search only (no floor board).
 * Staff key: student + tutor search + floor board.
 * 13/F availability: staff key + AVAILABILITY_PASSWORD (Script Property) + session token.
 *
 * Keep STAFF_KEY / TUTOR_KEY in sync with app.js.
 * Set Script Property AVAILABILITY_PASSWORD (do not commit the real password).
 */
var STAFF_KEY = "achievers-wc-staff-2026";
var TUTOR_KEY = "achievers-tutor";
var SCRIPT_TZ = "Asia/Hong_Kong";

var WAN_CHAI_CALENDAR_ID = "admin@achievershk.com";
var PRINCE_EDWARD_CALENDAR_ID =
  "c_28fff8f0d02e4c32dd8f2ddbdf058fd2218371f55f10e8c905e2f56b99d541f1@group.calendar.google.com";
var HELIOS_13F_CALENDAR_ID = "admissions@helios-edu.com";

var BOARD_FLOORS = ["13", "10", "8"];
var AVAIL_ROOMS = ["CEO", "1309A", "1309B", "1309C", "1309D", "1309E", "1309G"];
var AVAIL_GRID_START = "09:00";
var AVAIL_GRID_END = "21:00";
var AVAIL_DEFAULT_START = "09:00";
var AVAIL_DEFAULT_END = "18:00";
var AVAIL_SLOT_MINUTES = 30;
var AVAIL_TOKEN_TTL_SECONDS = 6 * 60 * 60;
var AVAIL_TOKEN_CACHE_PREFIX = "avail_tok_";
var SUBJECT_STOPWORDS = {
  igcse: true,
  alevel: true,
  as: true,
  a: true,
  level: true,
  gcse: true,
  gc: true,
  cie: true,
  ib: true,
  maths: true,
  math: true,
  mathematics: true,
  english: true,
  biology: true,
  chemistry: true,
  physics: true,
  econ: true,
  economics: true,
  psychology: true,
  history: true,
  geography: true,
  chinese: true,
  french: true,
  spanish: true,
  academic: true,
  tutorial: true,
  summer: true,
  higher: true,
  foundation: true,
  online: true,
  cancelled: true,
  student: true,
  students: true,
  tutor: true,
  teacher: true,
  wc: true,
  pe: true,
  y7: true,
  y8: true,
  y9: true,
  y10: true,
  y11: true,
  y12: true,
  y13: true,
  room: true,
  flat: true
};

var PAREN_NOISE = {
  online: true,
  cancelled: true,
  wc: true,
  pe: true
};

function doGet(e) {
  var params = (e && e.parameter) || {};
  var mode = String(params.mode || "search").toLowerCase().trim();
  var access = resolveAccess(params);

  if (mode === "board") {
    if (!access.staff) {
      return json({ error: "Staff access required", floors: null });
    }
    return json(buildBoard(params));
  }

  if (mode === "availability") {
    if (!access.staff) {
      return json({ error: "Staff access required", authRequired: true, rooms: null });
    }
    if (!isValidAvailToken(params && params.token)) {
      return json({ error: "Password required", authRequired: true, rooms: null });
    }
    return json(buildAvailability(params));
  }

  return json(runSearch(params, access));
}

function doPost(e) {
  var body = {};
  try {
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents) || {};
    }
  } catch (err) {
    return json({ error: "Invalid request body" });
  }

  var action = String(body.action || "").trim();
  if (action === "loginAvailability") {
    return json(loginAvailability(body));
  }

  return json({ error: "Unknown action" });
}

function resolveAccess(params) {
  var key = String((params && params.key) || "").trim();
  var staff = !!STAFF_KEY && key === STAFF_KEY;
  var tutor = !!TUTOR_KEY && key === TUTOR_KEY;
  return {
    staff: staff,
    tutor: tutor,
    // Staff can search both roles; tutor key is tutor-only.
    canSearchTutor: staff || tutor,
    canSearchStudent: staff || (!staff && !tutor)
  };
}

function getAvailabilityPassword() {
  try {
    return String(PropertiesService.getScriptProperties().getProperty("AVAILABILITY_PASSWORD") || "").trim();
  } catch (err) {
    return "";
  }
}

function loginAvailability(body) {
  var key = String((body && body.key) || "").trim();
  var password = String((body && body.password) || "").trim();
  var expected = getAvailabilityPassword();

  if (!STAFF_KEY || key !== STAFF_KEY) {
    return { error: "Staff access required", authRequired: true };
  }
  if (!expected) {
    return {
      error: "AVAILABILITY_PASSWORD is not set in Script Properties",
      authRequired: true
    };
  }
  if (password !== expected) {
    return { error: "Incorrect password", authRequired: true };
  }

  var token =
    Utilities.getUuid().replace(/-/g, "") +
    Utilities.getUuid().replace(/-/g, "").slice(0, 16);
  CacheService.getScriptCache().put(AVAIL_TOKEN_CACHE_PREFIX + token, "1", AVAIL_TOKEN_TTL_SECONDS);

  return {
    ok: true,
    token: token,
    expiresInSeconds: AVAIL_TOKEN_TTL_SECONDS
  };
}

function isValidAvailToken(token) {
  var t = String(token || "").trim();
  if (!t) return false;
  try {
    return !!CacheService.getScriptCache().get(AVAIL_TOKEN_CACHE_PREFIX + t);
  } catch (err) {
    return false;
  }
}

// ===== Board =====

function buildBoard(params) {
  var day = normalizeDay(params && params.day);
  var range = dayRange(day);
  var floors = { "13": [], "10": [], "8": [] };
  var events = getEventsForCalendars([WAN_CHAI_CALENDAR_ID], range.start, range.end);

  events.forEach(function (item) {
    var ev = item.ev;
    var title = ev.getTitle() || "";
    if (isCancelled(title)) return;

    var desc = ev.getDescription() || "";
    var locationField = ev.getLocation() || "";
    var combinedLower = (title + " " + desc + " " + locationField).toLowerCase();
    if (isOnline(combinedLower)) return;

    var roomData = extractRoom(title, desc, locationField);
    if (!roomData || !roomData.raw || roomData.raw === "TBC") return;

    var floor = floorFromRoom(roomData.raw);
    if (!floors.hasOwnProperty(floor)) return;

    floors[floor].push({
      title: title,
      student: extractStudentDisplayName(title, desc),
      start: ev.getStartTime(),
      end: ev.getEndTime(),
      room: roomData.raw,
      roomFormatted: roomData.formatted
    });
  });

  BOARD_FLOORS.forEach(function (f) {
    floors[f].sort(function (a, b) {
      return new Date(a.start) - new Date(b.start);
    });
  });

  return {
    day: day,
    date: Utilities.formatDate(range.start, SCRIPT_TZ, "yyyy-MM-dd"),
    floors: floors
  };
}

// ===== 13/F Availability (Helios calendar) =====

function buildAvailability(params) {
  var dateStr = normalizeAvailDate(params && params.date);
  var queryStartStr = normalizeAvailTime(params && params.start, AVAIL_DEFAULT_START);
  var queryEndStr = normalizeAvailTime(params && params.end, AVAIL_DEFAULT_END);

  if (timeToMinutes(queryEndStr) <= timeToMinutes(queryStartStr)) {
    queryEndStr = AVAIL_DEFAULT_END;
    if (timeToMinutes(queryEndStr) <= timeToMinutes(queryStartStr)) {
      queryStartStr = AVAIL_DEFAULT_START;
    }
  }

  var queryStart = parseDateTimeInTz(dateStr, queryStartStr);
  var queryEnd = parseDateTimeInTz(dateStr, queryEndStr);

  var now = new Date();
  var todayStr = Utilities.formatDate(now, SCRIPT_TZ, "yyyy-MM-dd");
  var nowLabel = Utilities.formatDate(now, SCRIPT_TZ, "HH:mm");
  var isToday = dateStr === todayStr;

  var slots = buildTimeSlots(AVAIL_GRID_START, AVAIL_GRID_END, AVAIL_SLOT_MINUTES);
  var roomEvents = collectAvailRoomEvents(dateStr);
  var todayRoomEvents = isToday ? roomEvents : collectAvailRoomEvents(todayStr);

  var rooms = AVAIL_ROOMS.map(function (id) {
    var dayList = roomEvents[id] || [];
    var todayList = todayRoomEvents[id] || [];
    var overlapping = dayList.filter(function (ev) {
      return datesOverlap(ev.start, ev.end, queryStart, queryEnd);
    });
    var nowStatus = computeNowStatus(todayList, now);

    return {
      id: id,
      label: availRoomLabel(id),
      status: overlapping.length ? "busy" : "available",
      events: overlapping.map(serializeAvailEvent),
      dayEvents: dayList.map(serializeAvailEvent),
      todayEvents: todayList.map(serializeAvailEvent),
      now: nowStatus
    };
  });

  var grid = {};
  var gridMeta = {};
  AVAIL_ROOMS.forEach(function (id) {
    grid[id] = slots.map(function () {
      return false;
    });
    gridMeta[id] = slots.map(function () {
      return null;
    });

    (roomEvents[id] || []).forEach(function (ev) {
      slots.forEach(function (slot, idx) {
        var slotStart = parseDateTimeInTz(dateStr, slot);
        var slotEnd = new Date(slotStart.getTime() + AVAIL_SLOT_MINUTES * 60 * 1000);
        if (datesOverlap(ev.start, ev.end, slotStart, slotEnd)) {
          grid[id][idx] = true;
          if (!gridMeta[id][idx]) {
            gridMeta[id][idx] = serializeAvailEvent(ev);
          }
        }
      });
    });
  });

  return {
    date: dateStr,
    start: queryStartStr,
    end: queryEndStr,
    today: todayStr,
    now: nowLabel,
    isToday: isToday,
    gridStart: AVAIL_GRID_START,
    gridEnd: AVAIL_GRID_END,
    rooms: rooms,
    slots: slots,
    grid: grid,
    gridMeta: gridMeta
  };
}

function collectAvailRoomEvents(dateStr) {
  var dayStart = parseDateTimeInTz(dateStr, "00:00");
  var dayEnd = parseDateTimeInTz(dateStr, "23:59");
  dayEnd.setSeconds(59, 999);

  var roomEvents = {};
  AVAIL_ROOMS.forEach(function (id) {
    roomEvents[id] = [];
  });

  var events = getEventsForCalendars([HELIOS_13F_CALENDAR_ID], dayStart, dayEnd);
  events.forEach(function (item) {
    var ev = item.ev;
    var title = ev.getTitle() || "";
    if (isCancelled(title)) return;

    var desc = ev.getDescription() || "";
    var locationField = ev.getLocation() || "";
    var roomId = matchAvailRoom(title, desc, locationField);
    if (!roomId || !roomEvents.hasOwnProperty(roomId)) return;

    var evStart = ev.getStartTime();
    var evEnd = ev.getEndTime();
    roomEvents[roomId].push({
      title: title,
      start: evStart,
      end: evEnd,
      startLabel: Utilities.formatDate(evStart, SCRIPT_TZ, "HH:mm"),
      endLabel: Utilities.formatDate(evEnd, SCRIPT_TZ, "HH:mm")
    });
  });

  AVAIL_ROOMS.forEach(function (id) {
    roomEvents[id].sort(function (a, b) {
      return new Date(a.start) - new Date(b.start);
    });
  });

  return roomEvents;
}

function serializeAvailEvent(ev) {
  return {
    title: ev.title,
    start: ev.startLabel,
    end: ev.endLabel
  };
}

function mergeBusyIntervals(events) {
  var intervals = (events || [])
    .map(function (ev) {
      return { start: new Date(ev.start).getTime(), end: new Date(ev.end).getTime(), title: ev.title };
    })
    .filter(function (iv) {
      return iv.end > iv.start;
    })
    .sort(function (a, b) {
      return a.start - b.start;
    });

  if (!intervals.length) return [];

  var merged = [intervals[0]];
  for (var i = 1; i < intervals.length; i++) {
    var cur = intervals[i];
    var last = merged[merged.length - 1];
    if (cur.start <= last.end) {
      if (cur.end > last.end) last.end = cur.end;
      if (!last.title && cur.title) last.title = cur.title;
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

function computeNowStatus(dayEvents, now) {
  var nowMs = now.getTime();
  var merged = mergeBusyIntervals(dayEvents);

  for (var i = 0; i < merged.length; i++) {
    var iv = merged[i];
    if (iv.start <= nowMs && nowMs < iv.end) {
      var active = null;
      for (var j = 0; j < dayEvents.length; j++) {
        var ev = dayEvents[j];
        if (ev.start.getTime() <= nowMs && nowMs < ev.end.getTime()) {
          active = ev;
          break;
        }
      }
      return {
        status: "busy",
        until: Utilities.formatDate(new Date(iv.end), SCRIPT_TZ, "HH:mm"),
        summary: "Busy until " + Utilities.formatDate(new Date(iv.end), SCRIPT_TZ, "HH:mm"),
        eventTitle: active ? active.title : iv.title || ""
      };
    }
    if (iv.start > nowMs) {
      return {
        status: "available",
        until: Utilities.formatDate(new Date(iv.start), SCRIPT_TZ, "HH:mm"),
        summary: "Free until " + Utilities.formatDate(new Date(iv.start), SCRIPT_TZ, "HH:mm"),
        eventTitle: ""
      };
    }
  }

  return {
    status: "available",
    until: null,
    summary: "Free for the rest of today",
    eventTitle: ""
  };
}

function availRoomLabel(id) {
  if (id === "CEO") return "CEO Room";
  return id;
}

function matchAvailRoom(title, desc, location) {
  var text = [title, location, desc].join(" ");
  if (!text) return null;

  // Explicit 13/F room codes: "1309A:", "1309 A", "1309 Room C"
  var roomMatch = String(text).match(/\b1309\s*(?:Room\s*)?([A-EGa-eg])\b/i);
  if (roomMatch) {
    return "1309" + String(roomMatch[1]).toUpperCase();
  }

  // Helios titles often use "CEO Room: …"
  if (/\bCEO\s*Room\b/i.test(text) || /(^|[\s:])CEO\s*:/i.test(text)) {
    return "CEO";
  }

  // Short form on this calendar only: "Room B: …" → 1309B (ignore 804E etc.)
  if (/\b\d{3,4}\s*(?:Room\s*)?[A-Za-z]\b/i.test(text) && !/\b1309\b/i.test(text)) {
    return null;
  }
  var shortRoom = String(text).match(/(?:^|[\s:])Room\s*([A-EGa-eg])\b/i);
  if (shortRoom) {
    return "1309" + String(shortRoom[1]).toUpperCase();
  }

  return null;
}

function normalizeAvailDate(raw) {
  var s = String(raw || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return Utilities.formatDate(new Date(), SCRIPT_TZ, "yyyy-MM-dd");
}

function normalizeAvailTime(raw, fallback) {
  var s = String(raw || "").trim();
  var m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return fallback;
  var h = parseInt(m[1], 10);
  var min = parseInt(m[2], 10);
  if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) return fallback;
  if (min < 15) {
    min = 0;
  } else if (min < 45) {
    min = 30;
  } else {
    min = 0;
    h = (h + 1) % 24;
  }
  return pad2(h) + ":" + pad2(min);
}

function pad2(n) {
  return (n < 10 ? "0" : "") + n;
}

function timeToMinutes(hhmm) {
  var parts = String(hhmm || "").split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function buildTimeSlots(startStr, endStr, stepMinutes) {
  var slots = [];
  var start = timeToMinutes(startStr);
  var end = timeToMinutes(endStr);
  for (var t = start; t < end; t += stepMinutes) {
    slots.push(pad2(Math.floor(t / 60)) + ":" + pad2(t % 60));
  }
  return slots;
}

function parseDateTimeInTz(dateStr, timeStr) {
  // Build a Date in SCRIPT_TZ by formatting a known instant is awkward in Apps Script;
  // use Utilities.parseDate which respects the given timezone.
  return Utilities.parseDate(dateStr + " " + timeStr + ":00", SCRIPT_TZ, "yyyy-MM-dd HH:mm:ss");
}

function datesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// ===== Search =====

function runSearch(params, access) {
  var name = String(params.name || "").toLowerCase().trim();
  var role = String(params.role || "").toLowerCase().trim();
  var day = normalizeDay(params.day);
  var staff = !!(access && access.staff);
  var tutorOnly = !!(access && access.tutor) && !staff;

  if (!name) {
    return { error: "Missing name", results: [], choices: [] };
  }

  // Access rules
  if (tutorOnly) {
    role = "tutor";
  } else if (!staff) {
    // Public student link
    role = "student";
    if (name.replace(/\s+/g, "").length < 3) {
      return {
        error: "Enter at least 3 letters of your name.",
        results: [],
        choices: []
      };
    }
  }

  if (role !== "student" && role !== "tutor") {
    role = tutorOnly ? "tutor" : "student";
  }
  if (!staff && !tutorOnly && role === "tutor") {
    role = "student";
  }
  if (tutorOnly && role !== "tutor") {
    role = "tutor";
  }

  var calendars = [WAN_CHAI_CALENDAR_ID, PRINCE_EDWARD_CALENDAR_ID];
  var queryKeywords = tokenizeNameQuery(name);
  var keyword = queryKeywords.length === 1 ? queryKeywords[0] : "";
  var shouldAskChoice = !!(keyword && (role === "student" || role === "tutor"));

  var range = dayRange(day);
  var results = [];
  var choiceSet = {};
  var personNameSet = {};

  getEventsForCalendars(calendars, range.start, range.end).forEach(function (item) {
    var ev = item.ev;
    var id = item.id;
    var title = ev.getTitle() || "";
    if (isCancelled(title)) return;

    var desc = ev.getDescription() || "";
    var locationField = ev.getLocation() || "";
    var rawCombined = (title + " " + desc + " " + locationField).trim();
    var combinedLower = rawCombined.toLowerCase();
    var split = splitTitleByRole(title);

    var displayPerson =
      role === "tutor"
        ? extractTutorDisplayName(title, desc)
        : extractStudentDisplayName(title, desc);

    var targetSegment = "";
    if (role === "student") {
      targetSegment = (
        split.student +
        " " +
        extractStudentsFromDescription(desc) +
        " " +
        displayPerson
      ).toLowerCase();
    } else if (role === "tutor") {
      targetSegment = (
        split.tutor +
        " " +
        extractTutorFromDescription(desc) +
        " " +
        displayPerson
      ).toLowerCase();
    } else {
      targetSegment = combinedLower;
    }

    if (!matchName(targetSegment, name)) return;

    // Skip online for on-site room finder results? Keep online for search (student/tutor still want it).
    var online = isOnline(combinedLower) || isOnlineMode(desc);
    var roomData = extractRoom(title, desc, locationField);

    if (displayPerson && displayPerson !== "Group class" && displayPerson !== "Lesson") {
      personNameSet[displayPerson] = true;
    }

    var row = {
      student: role === "tutor" ? extractStudentDisplayName(title, desc) : displayPerson,
      tutor: role === "tutor" ? displayPerson : extractTutorDisplayName(title, desc),
      start: ev.getStartTime(),
      end: ev.getEndTime(),
      location: detectLocation(id),
      mode: online ? "Online" : "On-site",
      room: online ? "Online" : roomData.raw,
      roomFormatted: online ? "" : roomData.formatted
    };

    // Full calendar titles — staff/tutor links only (not public student).
    if (staff || tutorOnly) {
      row.title = title;
    }

    results.push(row);

    if (shouldAskChoice || !staff) {
      var segmentRaw =
        role === "tutor"
          ? split.tutor + " " + extractTutorFromDescription(desc)
          : split.student + " " + extractStudentsFromDescription(desc);
      extractNameChoicesFromSegment(segmentRaw, keyword || name).forEach(function (c) {
        var cleanedChoice = cleanPersonChoice(c);
        if (cleanedChoice) choiceSet[cleanedChoice] = true;
      });
      var cleanedPerson = cleanPersonChoice(displayPerson);
      if (cleanedPerson) choiceSet[cleanedPerson] = true;
    }
  });

  // Prefer clean person display names when disambiguating.
  var choices = Object.keys(choiceSet).map(cleanPersonChoice).filter(Boolean);
  choices = uniqueStrings(choices);
  var fromPeople = Object.keys(personNameSet).map(cleanPersonChoice).filter(Boolean);
  fromPeople = uniqueStrings(fromPeople);
  if (fromPeople.length >= 1) {
    choices = fromPeople;
  }

  if (choices.length > 1 && (shouldAskChoice || !staff || tutorOnly)) {
    return { choices: choices, results: [], day: day };
  }

  results.sort(function (a, b) {
    return new Date(a.start) - new Date(b.start);
  });

  return {
    results: results,
    choices: [],
    staff: staff,
    tutor: tutorOnly,
    day: day
  };
}

// ===== Calendar helpers =====

function normalizeDay(day) {
  var d = String(day || "today").toLowerCase().trim();
  if (d === "tomorrow" || d === "tmr" || d === "1") return "tomorrow";
  return "today";
}

function dayRange(day) {
  var offset = normalizeDay(day) === "tomorrow" ? 1 : 0;
  // Anchor to Hong Kong calendar day (not the script server's local TZ).
  var todayLocal = Utilities.formatDate(new Date(), SCRIPT_TZ, "yyyy-MM-dd");
  var parts = todayLocal.split("-");
  var base = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2]) + offset,
    0,
    0,
    0,
    0
  );

  var start = new Date(base);
  start.setHours(0, 0, 0, 0);
  var end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return { start: start, end: end, day: normalizeDay(day) };
}

function getEventsForCalendars(calendarIds, start, end) {
  var out = [];
  calendarIds.forEach(function (id) {
    var cal = CalendarApp.getCalendarById(id);
    if (!cal) return;
    cal.getEvents(start, end).forEach(function (ev) {
      out.push({ id: id, ev: ev });
    });
  });
  return out;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// ===== Matching =====

function matchName(text, name) {
  var keywords = tokenizeNameQuery(name);
  if (!keywords.length) return false;

  var hay = String(text || "").toLowerCase();
  return keywords.every(function (kw) {
    var re = new RegExp("(^|[^a-z0-9])" + escapeRegExp(kw) + "([^a-z0-9]|$)", "i");
    if (re.test(hay)) return true;
    return kw.length >= 3 && hay.indexOf(kw) !== -1;
  });
}

function tokenizeNameQuery(name) {
  return String(name || "")
    .toLowerCase()
    .split(/[\s,+/&]+/)
    .map(function (k) {
      return k.replace(/[^a-z0-9']/g, "");
    })
    .filter(Boolean)
    .filter(function (k) {
      return k !== "x";
    })
    .filter(function (k, idx, arr) {
      // Drop duplicate tokens ("dan, dan" → ["dan"])
      return arr.indexOf(k) === idx;
    });
}

function uniqueStrings(arr) {
  var out = [];
  var seen = {};
  (arr || []).forEach(function (s) {
    var key = String(s || "").toLowerCase();
    if (!key || seen[key]) return;
    seen[key] = true;
    out.push(s);
  });
  return out;
}

function cleanPersonChoice(raw) {
  var val = String(raw || "").trim();
  if (!val) return "";
  if (/^(group class|lesson)$/i.test(val)) return "";

  // "Dan, Dan" / "Dan Dan" → "Dan"
  var parts = val
    .split(/[\s,+/&]+/)
    .map(function (p) {
      return p.replace(/[^A-Za-z'\-]/g, "");
    })
    .filter(Boolean);

  if (!parts.length) return "";

  var uniq = [];
  parts.forEach(function (p) {
    if (!uniq.length || uniq[uniq.length - 1].toLowerCase() !== p.toLowerCase()) {
      // also skip if same token already appears earlier
      var exists = uniq.some(function (u) {
        return u.toLowerCase() === p.toLowerCase();
      });
      if (!exists) uniq.push(p);
    }
  });

  if (uniq.length > 3) uniq = uniq.slice(0, 3);
  return uniq.join(" ");
}

function isOnline(text) {
  return /\bonline\b/i.test(String(text || ""));
}

function isOnlineMode(desc) {
  return /mode\s*:\s*online/i.test(String(desc || ""));
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isCancelled(title) {
  return /\bcancel+ed\b/i.test(String(title || "")) || /^\(cancelled\)/i.test(String(title || ""));
}

function detectLocation(id) {
  if (String(id || "").indexOf("admin") !== -1) return "Wan Chai";
  return "Prince Edward";
}

// ===== Room extraction =====

function extractRoom(title, desc, location) {
  var match = matchRoom(location);
  if (match) return formatMatch(match);

  match = matchRoom(desc);
  if (match) return formatMatch(match);

  match = matchRoom(title);
  if (match) return formatMatch(match);

  return { raw: "TBC", formatted: "TBC" };
}

function matchRoom(text) {
  if (!text) return null;
  // 1309G, 1012B, 804F, or "1309 Room C"
  var re = /\b(\d{3,4})\s*(?:Room\s*)?([A-Za-z])?\b/i;
  var m = String(text).match(re);
  if (!m) return null;

  var number = m[1];
  // Ignore years / random 4-digit noise that is not a floor room (e.g. 2029)
  if (!looksLikeRoomNumber(number)) return null;
  return m;
}

function looksLikeRoomNumber(number) {
  var n = String(number || "");
  if (n.length === 3) {
    var f3 = n.charAt(0);
    return f3 === "8" || f3 === "9";
  }
  if (n.length === 4) {
    var f2 = n.slice(0, 2);
    return f2 === "08" || f2 === "10" || f2 === "13" || f2 === "11" || f2 === "12";
  }
  return false;
}

function formatMatch(match) {
  var number = match[1];
  var letter = match[2] ? String(match[2]).toUpperCase() : "";
  return {
    raw: number + letter,
    formatted: formatRoom(number, letter)
  };
}

function formatRoom(number, letter) {
  var floorDigits = String(number).length === 3 ? String(number).charAt(0) : String(number).slice(0, 2);
  var floorText = parseInt(floorDigits, 10) + "/F";
  var flatText = "Flat " + number;
  var roomText = letter ? "Room " + letter : "";
  return [floorText, flatText, roomText].filter(Boolean).join(", ");
}

function floorFromRoom(raw) {
  var m = String(raw || "").match(/^(\d{3,4})/);
  if (!m) return "";
  var number = m[1];
  if (number.length === 3) return number.charAt(0);
  return number.slice(0, 2);
}

// ===== Name / title parsing =====

function splitTitleByRole(title) {
  var parts = String(title || "").split(/\s+x\s+/i);
  if (parts.length < 2) {
    return { student: String(title || ""), tutor: String(title || "") };
  }
  return {
    student: parts[0].trim(),
    tutor: parts.slice(1).join(" x ").trim()
  };
}

function getRoleSegmentRaw(rawCombined, role) {
  var parts = String(rawCombined || "").split(/\s+x\s+/i);
  if (parts.length < 2) return String(rawCombined || "");
  if (role === "tutor") return parts.slice(1).join(" x ").trim();
  if (role === "student") return parts[0].trim();
  return String(rawCombined || "");
}

function stripNoiseFromSegment(segment) {
  return String(segment || "")
    .replace(/^\((?:online|cancelled)\)\s*/i, "")
    .replace(/\((?:online|cancelled)\)/gi, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(student|students|tutor|teacher|subject|branch|mode)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeToken(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isStopwordToken(t) {
  var lower = normalizeToken(t);
  return !lower || !!SUBJECT_STOPWORDS[lower];
}

function looksLikeNameToken(t) {
  var s = String(t || "");
  if (!/^[A-Za-z][A-Za-z'\-]*$/.test(s)) return false;
  if (isStopwordToken(s)) return false;
  // Reject ALL-CAPS subject codes (CIE, IGCSE already stopwords; catch others)
  if (/^[A-Z]{2,}$/.test(s) && s.length <= 5) return false;
  return true;
}

/** Pull person names from parentheses, e.g. "(Jacob Wong + Lucas Wang)". */
function extractParentheticalNames(text) {
  var matches = String(text || "").match(/\(([^)]+)\)/g) || [];
  for (var i = matches.length - 1; i >= 0; i--) {
    var inner = matches[i].replace(/^\(|\)$/g, "").trim();
    var lower = inner.toLowerCase();
    if (PAREN_NOISE[lower]) continue;
    if (/^\d{4}$/.test(inner)) continue; // years
    if (/^(wc|pe|online|cancelled)\b/i.test(inner)) continue;

    // Split group lists
    var people = inner.split(/\s*(?:\+|\/|&|,| and )\s*/i).map(function (p) {
      return p.trim();
    }).filter(Boolean);

    var nameParts = [];
    people.forEach(function (person) {
      var words = person.split(/\s+/).filter(looksLikeNameToken);
      if (words.length >= 1 && words.length <= 3) {
        nameParts.push(words.join(" "));
      }
    });

    if (nameParts.length === 1) return nameParts[0];
    if (nameParts.length > 1) {
      // Dedupe repeated names before joining
      return uniqueStrings(nameParts).slice(0, 3).join(", ");
    }
  }
  return "";
}

function collectLeadingNameTokens(tokens) {
  var nameTokens = [];
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (!looksLikeNameToken(t)) {
      if (nameTokens.length) break;
      continue;
    }
    nameTokens.push(t);
    if (nameTokens.length >= 3) break;
  }
  return nameTokens;
}

function extractStudentsFromDescription(desc) {
  var m = String(desc || "").match(/students?\s*:\s*([^\n]+)/i);
  return m ? m[1].replace(/^[\s\-–—]+/, "").trim() : "";
}

function extractTutorFromDescription(desc) {
  var m = String(desc || "").match(/tutor\s*:\s*([^\n]+)/i);
  return m ? m[1].trim() : "";
}

function extractStudentDisplayName(title, desc) {
  var split = splitTitleByRole(title);
  var studentSide = split.student || "";

  var fromDesc = extractStudentsFromDescription(desc || "");
  if (fromDesc) {
    var descClean = stripNoiseFromSegment(fromDesc);
    var descTokens = collectLeadingNameTokens(descClean.split(/\s+/).filter(Boolean));
    if (descTokens.length) return cleanPersonChoice(descTokens.join(" ")) || descTokens.join(" ");
  }

  var fromParen = extractParentheticalNames(studentSide) || extractParentheticalNames(title);
  if (fromParen) return cleanPersonChoice(fromParen) || fromParen;

  var cleaned = stripNoiseFromSegment(studentSide);
  if (!cleaned) return "Group class";

  var tokens = cleaned.split(/\s+/).filter(Boolean);
  var nameTokens = collectLeadingNameTokens(tokens);

  if (!nameTokens.length) {
    var i = 0;
    while (i < tokens.length && isStopwordToken(tokens[i])) i++;
    nameTokens = collectLeadingNameTokens(tokens.slice(i));
  }

  if (nameTokens.length) {
    return cleanPersonChoice(nameTokens.join(" ")) || nameTokens.join(" ");
  }

  return "Group class";
}

function extractTutorDisplayName(title, desc) {
  var fromDesc = extractTutorFromDescription(desc || "");
  if (fromDesc) {
    var cleanedDesc = stripNoiseFromSegment(fromDesc);
    var descTokens = collectLeadingNameTokens(cleanedDesc.split(/\s+/).filter(Boolean));
    if (descTokens.length) return cleanPersonChoice(descTokens.join(" ")) || descTokens.join(" ");
    if (cleanedDesc) return cleanPersonChoice(cleanedDesc) || cleanedDesc;
  }

  var split = splitTitleByRole(title);
  var tutorSide = split.tutor || "";
  var cleaned = stripNoiseFromSegment(tutorSide);
  if (!cleaned) return "";

  var tokens = cleaned.split(/\s+/).filter(Boolean);
  var nameTokens = collectLeadingNameTokens(tokens);
  if (nameTokens.length) return cleanPersonChoice(nameTokens.join(" ")) || nameTokens.join(" ");

  var first = tokens.filter(function (t) {
    return looksLikeNameToken(t) || (/^[A-Za-z]{2,}$/.test(t) && !isStopwordToken(t));
  })[0];
  return first || cleanPersonChoice(cleaned) || cleaned;
}

function extractNameChoicesFromSegment(segmentRaw, keyword) {
  if (!segmentRaw || !keyword) return [];

  var keywords = tokenizeNameQuery(keyword);
  var kw = keywords[0] || "";
  if (!kw) return [];

  var cleaned = stripNoiseFromSegment(segmentRaw);
  var parts = cleaned.split(/,|&|\band\b|\+/i).map(function (s) {
    return s.trim();
  });

  var results = {};

  parts.forEach(function (part) {
    if (!part) return;
    var lower = part.toLowerCase();
    if (lower.indexOf(kw) === -1) return;

    var tokens = part.split(/\s+/).filter(Boolean);
    var nameTokens = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var tl = normalizeToken(t);
      if (!tl) continue;
      if (SUBJECT_STOPWORDS[tl]) break;
      if (!looksLikeNameToken(t) && nameTokens.length) break;
      if (!looksLikeNameToken(t)) continue;
      nameTokens.push(t);
      if (nameTokens.length >= 3) break;
    }

    var candidate = cleanPersonChoice(nameTokens.join(" "));
    if (!candidate) return;
    if (candidate.toLowerCase().indexOf(kw) === -1) return;
    results[candidate] = true;
  });

  var allTokens = cleaned.match(/[A-Za-z]+/g) || [];
  for (var i = 0; i < allTokens.length; i++) {
    if (allTokens[i].toLowerCase() !== kw) continue;
    var prev = i > 0 ? allTokens[i - 1] : "";
    var next = i + 1 < allTokens.length ? allTokens[i + 1] : "";
    var prevLower = (prev || "").toLowerCase();
    var nextLower = (next || "").toLowerCase();

    if (prev && prevLower !== "x" && !SUBJECT_STOPWORDS[prevLower] && looksLikeNameToken(prev)) {
      var left = cleanPersonChoice(prev + " " + allTokens[i]);
      if (left) results[left] = true;
    }
    if (next && nextLower !== "x" && !SUBJECT_STOPWORDS[nextLower] && looksLikeNameToken(next)) {
      var right = cleanPersonChoice(allTokens[i] + " " + next);
      if (right) results[right] = true;
    }
    results[allTokens[i]] = true;
  }

  return Object.keys(results);
}
