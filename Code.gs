/**
 * Achievers Room Finder — Google Apps Script backend
 *
 * Deploy as Web App (Execute as: Me, Who has access: Anyone).
 * Endpoints:
 *   ?mode=board&key=STAFF_KEY              → floor board (staff only)
 *   ?mode=search&name=...&role=...&key=... → name search
 *
 * Public (no key): student role only, full name required (2+ words), no lesson titles.
 * Staff (valid key): tutor search + floor board unlocked.
 *
 * Keep STAFF_KEY in sync with app.js.
 */
var STAFF_KEY = "achievers-wc-staff-2026";

var WAN_CHAI_CALENDAR_ID = "admin@achievershk.com";
var PRINCE_EDWARD_CALENDAR_ID =
  "c_28fff8f0d02e4c32dd8f2ddbdf058fd2218371f55f10e8c905e2f56b99d541f1@group.calendar.google.com";

var BOARD_FLOORS = ["13", "10", "8"];
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
  var staff = isStaffRequest(params);

  if (mode === "board") {
    if (!staff) {
      return json({ error: "Staff access required", floors: null });
    }
    return json(buildBoard());
  }

  return json(runSearch(params, staff));
}

function isStaffRequest(params) {
  var key = String((params && params.key) || "").trim();
  return !!STAFF_KEY && key === STAFF_KEY;
}

// ===== Board =====

function buildBoard() {
  var range = todayRange();
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
      student: extractStudentDisplayName(title),
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
    date: Utilities.formatDate(range.start, Session.getScriptTimeZone(), "yyyy-MM-dd"),
    floors: floors
  };
}

// ===== Search =====

function runSearch(params, staff) {
  var name = String(params.name || "").toLowerCase().trim();
  var role = String(params.role || "").toLowerCase().trim();

  if (!name) {
    return { error: "Missing name", results: [], choices: [] };
  }

  // Public link: students only, require first + last (or more) to reduce casual lookups.
  if (!staff) {
    role = "student";
    var publicParts = name.split(/\s+/).filter(Boolean);
    if (publicParts.length < 2) {
      return {
        error: "Enter your full name (first and last).",
        results: [],
        choices: []
      };
    }
  }

  if (role !== "student" && role !== "tutor") {
    role = staff ? role : "student";
  }
  if (!staff && role === "tutor") {
    role = "student";
  }

  var calendars = [WAN_CHAI_CALENDAR_ID, PRINCE_EDWARD_CALENDAR_ID];
  var queryKeywords = name.split(/\s+/).filter(Boolean);
  var keyword = queryKeywords.length === 1 ? queryKeywords[0] : "";
  var shouldAskChoice = !!(keyword && (role === "student" || role === "tutor"));

  var range = todayRange();
  var results = [];
  var choiceSet = {};

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

    var targetSegment = "";
    if (role === "student") {
      targetSegment = split.student.toLowerCase();
    } else if (role === "tutor") {
      targetSegment = split.tutor.toLowerCase();
    } else {
      targetSegment = combinedLower;
    }

    if (!matchName(targetSegment, name)) return;

    var online = isOnline(combinedLower);
    var roomData = extractRoom(title, desc, locationField);
    var studentName = extractStudentDisplayName(title);

    var row = {
      student: studentName,
      start: ev.getStartTime(),
      end: ev.getEndTime(),
      location: detectLocation(id),
      mode: online ? "Online" : "On-site",
      room: online ? "Online" : roomData.raw,
      roomFormatted: online ? "" : roomData.formatted
    };

    // Full calendar titles can reveal tutors / other students — staff only.
    if (staff) {
      row.title = title;
    }

    results.push(row);

    if (shouldAskChoice) {
      var segmentRaw = getRoleSegmentRaw(rawCombined, role);
      extractNameChoicesFromSegment(segmentRaw, keyword).forEach(function (c) {
        choiceSet[c] = true;
      });
    }
  });

  if (shouldAskChoice) {
    var choices = Object.keys(choiceSet);
    if (choices.length > 1) {
      return { choices: choices, results: [] };
    }
  }

  results.sort(function (a, b) {
    return new Date(a.start) - new Date(b.start);
  });

  return { results: results, choices: [], staff: !!staff };
}

// ===== Calendar helpers =====

function todayRange() {
  var today = new Date();
  var start = new Date(today);
  start.setHours(0, 0, 0, 0);
  var end = new Date(today);
  end.setHours(23, 59, 59, 999);
  return { start: start, end: end };
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
  var keywords = String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .filter(function (k) {
      return k !== "x" && k !== "X";
    });
  if (!keywords.length) return false;

  var hay = String(text || "").toLowerCase();
  return keywords.every(function (k) {
    var kw = k.toLowerCase();
    // Word-ish boundary so short tokens like "an" do not match "Annie"
    var re = new RegExp("(^|[^a-z0-9])" + escapeRegExp(kw) + "([^a-z0-9]|$)", "i");
    if (re.test(hay)) return true;
    // Substring fallback for longer names / partial typing
    return kw.length >= 3 && hay.indexOf(kw) !== -1;
  });
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isOnline(text) {
  return String(text || "").toLowerCase().indexOf("online") !== -1;
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
    if (nameParts.length > 1) return nameParts.slice(0, 3).join(", ");
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

function extractStudentDisplayName(title) {
  var split = splitTitleByRole(title);
  var studentSide = split.student || "";

  // Group classes often put names in trailing parentheses.
  var fromParen = extractParentheticalNames(studentSide) || extractParentheticalNames(title);
  if (fromParen) return fromParen;

  var cleaned = stripNoiseFromSegment(studentSide);
  if (!cleaned) return "Group class";

  var tokens = cleaned.split(/\s+/).filter(Boolean);
  var nameTokens = collectLeadingNameTokens(tokens);

  // Subject-led titles: skip leading stopwords, then take name-like words if any.
  if (!nameTokens.length) {
    var i = 0;
    while (i < tokens.length && isStopwordToken(tokens[i])) i++;
    nameTokens = collectLeadingNameTokens(tokens.slice(i));
  }

  if (nameTokens.length) return nameTokens.join(" ");

  // Last resort: never show raw subject codes as a "student"
  return "Group class";
}

function extractNameChoicesFromSegment(segmentRaw, keyword) {
  if (!segmentRaw || !keyword) return [];

  var kw = String(keyword).toLowerCase();
  var cleaned = stripNoiseFromSegment(segmentRaw);
  var parts = cleaned.split(/,|&|\band\b|\+/i).map(function (s) {
    return s.trim();
  });

  var results = {};

  parts.forEach(function (part) {
    if (!part) return;
    var lower = part.toLowerCase();
    if (lower.indexOf(kw) === -1) return;

    // Prefer name-like prefix before subject stopwords
    var tokens = part.split(/\s+/).filter(Boolean);
    var nameTokens = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var tl = t.toLowerCase().replace(/[^a-z]/g, "");
      if (!tl) continue;
      if (SUBJECT_STOPWORDS[tl]) break;
      nameTokens.push(t);
      if (nameTokens.length >= 3) break;
    }

    var candidate = nameTokens.join(" ").trim();
    if (!candidate) candidate = part;

    // Keep 1–3 word choices that contain the keyword (allows "Traf", "Lai")
    var words = candidate.split(/\s+/).filter(Boolean);
    if (!words.length || words.length > 3) return;
    if (candidate.toLowerCase().indexOf(kw) === -1) return;

    results[candidate] = true;
  });

  // Also scan token windows around the keyword for "First Last"
  var allTokens = cleaned.match(/[A-Za-z]+/g) || [];
  for (var i = 0; i < allTokens.length; i++) {
    if (allTokens[i].toLowerCase() !== kw) continue;
    var prev = i > 0 ? allTokens[i - 1] : "";
    var next = i + 1 < allTokens.length ? allTokens[i + 1] : "";
    var prevLower = (prev || "").toLowerCase();
    var nextLower = (next || "").toLowerCase();

    if (prev && prevLower !== "x" && !SUBJECT_STOPWORDS[prevLower]) {
      results[prev + " " + allTokens[i]] = true;
    }
    if (next && nextLower !== "x" && !SUBJECT_STOPWORDS[nextLower]) {
      results[allTokens[i] + " " + next] = true;
    }
    // Single-token tutor/student names
    results[allTokens[i]] = true;
  }

  return Object.keys(results);
}
