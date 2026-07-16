const API_URL = "https://script.google.com/macros/s/AKfycbya1NUgktlSXAT2KonO9uUSMd5qu3S2_1AcngEadxrd6b3yaEr2HpeS46G4n6VmfsoLWg/exec";

/** Must match keys in Code.gs. Change both sides when rotating. */
const STAFF_KEY = "achievers-wc-staff-2026";
const TUTOR_KEY = "achievers-tutor";
const STAFF_SESSION_KEY = "achievers_staff_key";
const TUTOR_SESSION_KEY = "achievers_tutor_key";
const AVAIL_TOKEN_SESSION_KEY = "achievers_avail_token";

const RESULTS_RESET_MS = 60 * 1000;
const BOARD_REFRESH_MS = 60 * 1000;
const AVAIL_REFRESH_MS = 60 * 1000;
const BOARD_FLOORS = ["13", "10", "8"];
const AVAIL_GRID_START_MIN = 9 * 60;
const AVAIL_GRID_END_MIN = 21 * 60;
const AVAIL_PX_PER_MIN = 1.1;

const HELP_PHONE = "+852 5727 1209";
const HELP_ADDRESS = "Room 1012, 10/F, Tai Yau Building, 181 Johnston Road, Wan Chai";

const STUDENT_HELP = {
  title: "Can't find your room?",
  body: `Please visit the Room Management Desktop at ${HELP_ADDRESS} to check today’s floor board.`,
  note: "Rooms can change occasionally — please double-check your room before class.",
  contact: `Still stuck? Call ${HELP_PHONE}.`
};

const TUTOR_HELP = {
  title: "Can't find your lesson room?",
  body: `Please visit the Room Management Desktop at ${HELP_ADDRESS} to check today’s floor board.`,
  note: "Rooms can change occasionally — please double-check your room before class.",
  contact: `Need help? Call ${HELP_PHONE}.`
};

let resultsResetTimerId = null;
let boardRefreshTimerId = null;
let availRefreshTimerId = null;
let boardData = null;
let availData = null;
let activeFloor = "13";
let currentMode = "search";
let staffMode = false;
let tutorMode = false;
/** "today" | "tomorrow" — shared by search + floor board */
let selectedDay = "today";
let lastSearchQuery = null;
let lastSearchRole = "student";
let availControlsReady = false;

function dayQueryParam() {
  return `&day=${encodeURIComponent(selectedDay)}`;
}

function dayWord() {
  return selectedDay === "tomorrow" ? "tomorrow" : "today";
}

function dayTitleWord() {
  return selectedDay === "tomorrow" ? "Tomorrow" : "Today";
}

function getDayDateObject(day) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  if (day === "tomorrow") d.setDate(d.getDate() + 1);
  return d;
}

function formatDayDateLabel(day) {
  return getDayDateObject(day).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function updateDayNavUI() {
  const isToday = selectedDay === "today";
  const label = dayTitleWord();
  const dateText = formatDayDateLabel(selectedDay);

  const searchLabel = document.getElementById("searchDayLabel");
  const searchDate = document.getElementById("searchDayDate");
  const boardLabel = document.getElementById("boardDayLabel");
  const boardDate = document.getElementById("boardDateLabel");
  const boardTitle = document.getElementById("boardTitle");
  const prevSearch = document.getElementById("searchDayPrev");
  const nextSearch = document.getElementById("searchDayNext");
  const prevBoard = document.getElementById("boardDayPrev");
  const nextBoard = document.getElementById("boardDayNext");

  if (searchLabel) searchLabel.textContent = label;
  if (searchDate) searchDate.textContent = dateText;
  if (boardLabel) boardLabel.textContent = label;
  if (boardDate) boardDate.textContent = dateText;
  if (boardTitle) boardTitle.textContent = `${label}’s rooms — Wan Chai`;

  if (prevSearch) prevSearch.disabled = isToday;
  if (nextSearch) nextSearch.disabled = !isToday;
  if (prevBoard) prevBoard.disabled = isToday;
  if (nextBoard) nextBoard.disabled = !isToday;
}

async function setSelectedDay(day) {
  const next = day === "tomorrow" ? "tomorrow" : "today";
  if (selectedDay === next) return;
  selectedDay = next;
  updateDayNavUI();

  if (currentMode === "board" && staffMode) {
    await loadBoard();
    return;
  }

  // Re-run last search when the day changes, if there was one.
  const nameInput = document.getElementById("name");
  const div = document.getElementById("results");
  const btn = document.getElementById("searchBtn");
  const query = (lastSearchQuery || nameInput?.value || "").trim();
  if (query && div && btn && nameInput) {
    await runQuery(query, {
      nameInput,
      div,
      btn,
      role: lastSearchRole || "student"
    });
  } else if (div) {
    div.innerHTML = "";
    hideRefreshButton();
  }
}

function initDayNav() {
  document.getElementById("searchDayPrev")?.addEventListener("click", () => setSelectedDay("today"));
  document.getElementById("searchDayNext")?.addEventListener("click", () => setSelectedDay("tomorrow"));
  document.getElementById("boardDayPrev")?.addEventListener("click", () => setSelectedDay("today"));
  document.getElementById("boardDayNext")?.addEventListener("click", () => setSelectedDay("tomorrow"));
  updateDayNavUI();
}

function resolveAccessMode() {
  const params = new URLSearchParams(window.location.search);
  const staffFromUrl = (params.get("staff") || "").trim();
  const tutorFromUrl = (params.get("tutor") || "").trim();

  if (staffFromUrl && staffFromUrl === STAFF_KEY) {
    sessionStorage.setItem(STAFF_SESSION_KEY, STAFF_KEY);
    sessionStorage.removeItem(TUTOR_SESSION_KEY);
    return { staff: true, tutor: false };
  }

  if (tutorFromUrl && tutorFromUrl === TUTOR_KEY) {
    sessionStorage.setItem(TUTOR_SESSION_KEY, TUTOR_KEY);
    sessionStorage.removeItem(STAFF_SESSION_KEY);
    return { staff: false, tutor: true };
  }

  if (staffFromUrl && staffFromUrl !== STAFF_KEY) {
    sessionStorage.removeItem(STAFF_SESSION_KEY);
  }
  if (tutorFromUrl && tutorFromUrl !== TUTOR_KEY) {
    sessionStorage.removeItem(TUTOR_SESSION_KEY);
  }

  // Prefer staff session if both somehow exist.
  if (sessionStorage.getItem(STAFF_SESSION_KEY) === STAFF_KEY) {
    return { staff: true, tutor: false };
  }
  if (sessionStorage.getItem(TUTOR_SESSION_KEY) === TUTOR_KEY) {
    return { staff: false, tutor: true };
  }

  return { staff: false, tutor: false };
}

function accessQueryParam() {
  if (staffMode) return `&key=${encodeURIComponent(STAFF_KEY)}`;
  if (tutorMode) return `&key=${encodeURIComponent(TUTOR_KEY)}`;
  return "";
}

function applyAccessMode() {
  const access = resolveAccessMode();
  staffMode = access.staff;
  tutorMode = access.tutor;

  const modeSwitch = document.getElementById("modeSwitch");
  const staffBadge = document.getElementById("staffBadge");
  const subtitle = document.getElementById("appSubtitle");
  const nameLabel = document.getElementById("nameLabel");
  const nameInput = document.getElementById("name");
  const helpEl = document.getElementById("portalHelp");

  if (modeSwitch) modeSwitch.hidden = !staffMode;
  if (staffBadge) {
    staffBadge.hidden = !(staffMode || tutorMode);
    staffBadge.textContent = staffMode
      ? "Staff / kiosk mode"
      : tutorMode
        ? "Tutor mode"
        : "";
  }

  updatePortalHelp();

  if (staffMode) {
    if (subtitle) subtitle.textContent = "Staff mode — search, floor board, or 13/F availability.";
    if (nameLabel) nameLabel.textContent = "Student / Tutor name";
    if (nameInput) nameInput.placeholder = "Enter student or tutor name (e.g. Peter Chan)";
  } else if (tutorMode) {
    if (subtitle) subtitle.textContent = "Tutor mode — search your name to find today’s rooms.";
    if (nameLabel) nameLabel.textContent = "Your tutor name";
    if (nameInput) nameInput.placeholder = "e.g. Jay or Traf";
    setMode("search");
  } else {
    if (subtitle) subtitle.textContent = "Search your name to find your room (today or tomorrow).";
    if (nameLabel) nameLabel.textContent = "Your name";
    if (nameInput) nameInput.placeholder = "e.g. Jayden or Peter Chan";
    setMode("search");
  }
}

function currentHelpContent() {
  if (staffMode) return null;
  return tutorMode ? TUTOR_HELP : STUDENT_HELP;
}

function fillHelpCard(el, content) {
  if (!el || !content) return;
  el.innerHTML = "";

  const title = document.createElement("p");
  title.className = "helpNoteTitle";
  title.textContent = content.title;

  const body = document.createElement("p");
  body.className = "helpNoteBody";
  body.textContent = content.body;

  el.appendChild(title);
  el.appendChild(body);

  if (content.note) {
    const note = document.createElement("p");
    note.className = "helpNoteBody helpNoteReminder";
    note.textContent = content.note;
    el.appendChild(note);
  }

  const contact = document.createElement("p");
  contact.className = "helpNoteContact";
  const match = String(content.contact || "").match(/^(.*?)(\+852[\d\s]+)(.*)$/);
  if (match) {
    contact.append(match[1]);
    const link = document.createElement("a");
    link.href = `tel:${HELP_PHONE.replace(/\s+/g, "")}`;
    link.textContent = match[2].trim();
    contact.appendChild(link);
    contact.append(match[3] || "");
  } else {
    contact.textContent = content.contact || "";
  }

  el.appendChild(contact);
}

function updatePortalHelp() {
  const helpEl = document.getElementById("portalHelp");
  if (!helpEl) return;

  const content = currentHelpContent();
  if (!content) {
    helpEl.hidden = true;
    helpEl.innerHTML = "";
    return;
  }

  helpEl.hidden = false;
  fillHelpCard(helpEl, content);
}

function createHelpNoteElement() {
  const content = currentHelpContent();
  if (!content) return null;
  const el = document.createElement("div");
  el.className = "helpNote";
  fillHelpCard(el, content);
  return el;
}

function cancelResultsReset() {
  if (resultsResetTimerId !== null) {
    clearTimeout(resultsResetTimerId);
    resultsResetTimerId = null;
  }
}

function cancelBoardRefresh() {
  if (boardRefreshTimerId !== null) {
    clearTimeout(boardRefreshTimerId);
    boardRefreshTimerId = null;
  }
}

function cancelAvailRefresh() {
  if (availRefreshTimerId !== null) {
    clearTimeout(availRefreshTimerId);
    availRefreshTimerId = null;
  }
}

function scheduleResultsReset(div) {
  cancelResultsReset();
  resultsResetTimerId = setTimeout(() => {
    resultsResetTimerId = null;
    div.innerHTML = "";
    hideRefreshButton();
  }, RESULTS_RESET_MS);
}

function scheduleBoardRefresh() {
  cancelBoardRefresh();
  boardRefreshTimerId = setTimeout(() => {
    boardRefreshTimerId = null;
    if (currentMode === "board") {
      loadBoard({ silent: true });
    }
  }, BOARD_REFRESH_MS);
}

function showRefreshButton() {
  const el = document.getElementById("refreshBtn");
  if (el) el.removeAttribute("hidden");
}

function hideRefreshButton() {
  const el = document.getElementById("refreshBtn");
  if (el) el.setAttribute("hidden", "");
}

function resetSearch() {
  cancelResultsReset();
  const nameInput = document.getElementById("name");
  const div = document.getElementById("results");
  if (nameInput) nameInput.value = "";
  if (div) div.innerHTML = "";
  hideRefreshButton();
  nameInput?.focus();
}

function setMode(mode) {
  if ((mode === "board" || mode === "availability") && !staffMode) {
    mode = "search";
  }

  if (mode === "board") currentMode = "board";
  else if (mode === "availability") currentMode = "availability";
  else currentMode = "search";

  const searchPanel = document.getElementById("searchPanel");
  const boardPanel = document.getElementById("boardPanel");
  const availPanel = document.getElementById("availPanel");
  const searchBtn = document.getElementById("modeSearchBtn");
  const boardBtn = document.getElementById("modeBoardBtn");
  const availBtn = document.getElementById("modeAvailBtn");

  const isSearch = currentMode === "search";
  const isBoard = currentMode === "board";
  const isAvail = currentMode === "availability";

  if (searchPanel) searchPanel.hidden = !isSearch;
  if (boardPanel) boardPanel.hidden = !isBoard || !staffMode;
  if (availPanel) availPanel.hidden = !isAvail || !staffMode;

  searchBtn?.classList.toggle("is-active", isSearch);
  boardBtn?.classList.toggle("is-active", isBoard);
  availBtn?.classList.toggle("is-active", isAvail);
  searchBtn?.setAttribute("aria-selected", String(isSearch));
  boardBtn?.setAttribute("aria-selected", String(isBoard));
  availBtn?.setAttribute("aria-selected", String(isAvail));

  cancelBoardRefresh();
  cancelAvailRefresh();
  if (isSearch) {
    // leave search as-is
  } else if (isBoard) {
    cancelResultsReset();
    document.querySelectorAll(".modalOverlay").forEach(el => el.remove());
    loadBoard();
  } else if (isAvail) {
    cancelResultsReset();
    document.querySelectorAll(".modalOverlay").forEach(el => el.remove());
    enterAvailabilityMode();
  }
}

function initModeSwitch() {
  document.getElementById("modeSearchBtn")?.addEventListener("click", () => setMode("search"));
  document.getElementById("modeBoardBtn")?.addEventListener("click", () => {
    if (!staffMode) return;
    setMode("board");
  });
  document.getElementById("modeAvailBtn")?.addEventListener("click", () => {
    if (!staffMode) return;
    setMode("availability");
  });

  document.getElementById("floorTabs")?.addEventListener("click", e => {
    const tab = e.target.closest(".floorTab");
    if (!tab) return;
    const floor = tab.getAttribute("data-floor");
    if (!floor) return;
    setActiveFloor(floor);
    renderBoard();
  });

  document.getElementById("availUnlockBtn")?.addEventListener("click", () => {
    promptAvailPassword();
  });
  document.getElementById("availLogoutBtn")?.addEventListener("click", () => {
    clearAvailToken();
    availData = null;
    updateAvailAuthUI(false);
  });
}

function setActiveFloor(floor) {
  activeFloor = String(floor);
  document.querySelectorAll(".floorTab").forEach(tab => {
    const on = tab.getAttribute("data-floor") === activeFloor;
    tab.classList.toggle("is-active", on);
    tab.setAttribute("aria-selected", String(on));
  });
}

function countNameParts(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter(p => p.toLowerCase() !== "x").length;
}

async function search() {
  const nameInput = document.getElementById("name");
  const rawQuery = (nameInput.value || "").trim();
  const div = document.getElementById("results");
  const btn = document.getElementById("searchBtn");

  cancelResultsReset();
  hideRefreshButton();
  div.innerHTML = "";

  if (!rawQuery) {
    div.appendChild(
      renderEmpty(
        "Enter your name",
        staffMode
          ? "Type a student or tutor name and press Search."
          : tutorMode
            ? "Type your tutor name and press Search."
            : "Type your name and press Search. If a few people match, you’ll pick yours."
      )
    );
    return;
  }

  if (!staffMode && !tutorMode && rawQuery.replace(/\s+/g, "").length < 3) {
    div.appendChild(
      renderEmpty("Name too short", "Enter at least 3 letters of your name.")
    );
    return;
  }

  // Public students & tutors: go straight to search (with name picker if needed).
  // Staff: ask Student vs Tutor first.
  if (!staffMode) {
    const role = tutorMode ? "tutor" : "student";
    await runQuery(rawQuery, { nameInput, div, btn, role });
    return;
  }

  showChoicesModal(
    ["Student", "Tutor"],
    async roleChoice => {
      const role = roleChoice === "Tutor" ? "tutor" : "student";
      const queryName = extractNameByRole(rawQuery, role) || rawQuery;
      nameInput.value = queryName;
      document.querySelectorAll(".modalOverlay").forEach(el => el.remove());
      await runQuery(queryName, { nameInput, div, btn, role });
    },
    () => {
      document.querySelectorAll(".modalOverlay").forEach(el => el.remove());
      div.innerHTML = "";
      div.appendChild(renderEmpty("Cancelled", "Select Student or Tutor to continue."));
    },
    {
      titleText: "Which role are you?",
      subText: "We will search your side of the input around 'x'.",
      modalId: "roleChoiceModal"
    }
  );
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

/** Compact range for the floor board so columns never collide. */
function formatBoardTimeRange(startStr, endStr) {
  const start = formatTime(startStr);
  const end = formatTime(endStr);
  if (!start || !end) return "TBC";

  const startMeridiem = (start.match(/\s*([AP]M)$/i) || [])[1];
  const endMeridiem = (end.match(/\s*([AP]M)$/i) || [])[1];

  if (
    startMeridiem &&
    endMeridiem &&
    startMeridiem.toUpperCase() === endMeridiem.toUpperCase()
  ) {
    const startBare = start.replace(/\s*[AP]M$/i, "").trim();
    return `${startBare} – ${end}`;
  }

  return `${start} – ${end}`;
}

function formatBoardDate(dateStr) {
  if (!dateStr) return "Today";
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function renderLoading(label) {
  const wrap = document.createElement("div");
  wrap.className = "loading";
  wrap.innerHTML = `
    <span class="spinner" aria-hidden="true"></span>
    <span>${label || "Loading..."}</span>
  `;
  return wrap;
}

function renderEmpty(mainText, subText) {
  const wrap = document.createElement("div");
  wrap.className = "empty";

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = mainText;

  const p = document.createElement("div");
  p.textContent = subText || "";

  wrap.appendChild(hint);
  if (subText) wrap.appendChild(p);

  const help = createHelpNoteElement();
  if (help) wrap.appendChild(help);

  return wrap;
}

function createEventCard(e) {
  const card = document.createElement("div");
  card.className = "card";

  const isOnline = ((e.mode || "") + " " + (e.room || "")).toLowerCase().includes("online");

  const top = document.createElement("div");
  top.className = "cardTop";

  const title = document.createElement("p");
  title.className = "cardTitle";
  if (tutorMode) {
    title.textContent = e.tutor || e.title || "Lesson";
  } else {
    title.textContent = e.student || e.title || "Lesson";
  }

  const start = formatTime(e.start);
  const end = formatTime(e.end);
  const time = document.createElement("div");
  time.className = "cardTime";
  time.textContent = start && end ? `${start} - ${end}` : "TBC";

  top.appendChild(title);
  top.appendChild(time);

  const meta = document.createElement("div");
  meta.className = "metaRow";

  const badge = document.createElement("span");
  badge.className = `badge ${isOnline ? "online" : "onsite"}`;
  badge.innerHTML = `<span class="dot" aria-hidden="true"></span>${isOnline ? "Online" : "On-site"}`;
  meta.appendChild(badge);

  const kv = document.createElement("div");
  kv.className = "kv";

  const location = e.location || "TBC";
  const room = isOnline
    ? "Online"
    : e.roomFormatted && e.roomFormatted !== "TBC"
      ? e.roomFormatted
      : e.room || "TBC";

  kv.appendChild(kvItem("Location", location));
  kv.appendChild(kvItem("Room", room));

  // Staff/tutor links may show the full calendar title.
  if ((staffMode || tutorMode) && e.title) {
    kv.appendChild(kvItem("Lesson", e.title));
  }

  card.appendChild(top);
  card.appendChild(meta);
  card.appendChild(kv);

  return card;
}

function kvItem(k, v) {
  const wrap = document.createElement("div");
  const key = document.createElement("div");
  key.className = "k";
  key.textContent = k;

  const val = document.createElement("div");
  val.className = "v";
  val.textContent = v;

  wrap.appendChild(key);
  wrap.appendChild(val);
  return wrap;
}

async function runQuery(query, { nameInput, div, btn, role }) {
  let choicesModalEl = null;

  cancelResultsReset();
  hideRefreshButton();
  btn.disabled = true;
  nameInput.disabled = true;
  div.innerHTML = "";
  div.appendChild(renderLoading());

  try {
    const url =
      `${API_URL}?mode=search` +
      `&name=${encodeURIComponent(query)}` +
      `&role=${encodeURIComponent(role || "")}` +
      dayQueryParam() +
      accessQueryParam();
    lastSearchQuery = query;
    lastSearchRole = role || "student";
    const res = await fetch(url);
    const data = await res.json();

    if (data?.error) {
      div.innerHTML = "";
      div.appendChild(
        renderEmpty(
          /3 letters/i.test(data.error) ? "Name too short" : "Could not search",
          data.error
        )
      );
      showRefreshButton();
      return;
    }

    if (Array.isArray(data)) {
      div.innerHTML = "";
      if (!data.length) {
        div.appendChild(renderEmpty(`No lessons ${dayWord()}`, "Please try another name."));
        scheduleResultsReset(div);
        showRefreshButton();
        return;
      }
      data.forEach(e => div.appendChild(createEventCard(e)));
      scheduleResultsReset(div);
      showRefreshButton();
      return;
    }

    const choices = Array.isArray(data?.choices) ? data.choices : null;
    const results = Array.isArray(data?.results) ? data.results : null;
    const safeChoices = sanitizeChoices(choices);

    if (safeChoices && safeChoices.length > 1) {
      div.innerHTML = "";
      choicesModalEl = showChoicesModal(
        safeChoices,
        async selectedName => {
          if (choicesModalEl) choicesModalEl.remove();
          nameInput.value = selectedName;
          await runQuery(selectedName, { nameInput, div, btn, role });
        },
        () => {
          if (choicesModalEl) choicesModalEl.remove();
          div.innerHTML = "";
          div.appendChild(renderEmpty("Cancelled", "Select a name to continue."));
        }
      );
      return;
    }

    if (
      safeChoices &&
      safeChoices.length === 1 &&
      (!results || results.length === 0) &&
      safeChoices[0] !== query
    ) {
      await runQuery(safeChoices[0], { nameInput, div, btn, role });
      return;
    }

    if (!results || results.length === 0) {
      div.innerHTML = "";
      div.appendChild(renderEmpty(`No lessons ${dayWord()}`, "Please try another name, or switch day."));
      scheduleResultsReset(div);
      showRefreshButton();
      return;
    }

    div.innerHTML = "";
    results.forEach(e => div.appendChild(createEventCard(e)));
    scheduleResultsReset(div);
    showRefreshButton();
  } catch (err) {
    console.error(err);
    div.innerHTML = "";
    div.appendChild(renderEmpty("Error loading data", "Please try again in a moment."));
    scheduleResultsReset(div);
    showRefreshButton();
  } finally {
    const anyModalOpen = document.querySelector(".modalOverlay");
    if (!anyModalOpen) {
      btn.disabled = false;
      nameInput.disabled = false;
    }
  }
}

function sanitizeChoices(choices) {
  if (!Array.isArray(choices)) return null;

  const out = [];
  const seen = new Set();

  choices.forEach(c => {
    let val = String(c || "").trim();
    if (!val) return;
    if (/^x\b/i.test(val)) return;
    if (/^students?\b/i.test(val)) return;
    if (/^(tutor|teacher)s?\b/i.test(val)) return;

    // Collapse "Dan, Dan" / duplicate tokens
    const parts = val
      .split(/[\s,+/&]+/)
      .map(p => p.replace(/[^A-Za-z'\-]/g, ""))
      .filter(Boolean);
    const uniq = [];
    parts.forEach(p => {
      if (!uniq.some(u => u.toLowerCase() === p.toLowerCase())) uniq.push(p);
    });
    val = uniq.slice(0, 3).join(" ");
    if (!val) return;

    const norm = val.toLowerCase();
    if (seen.has(norm)) return;
    seen.add(norm);
    out.push(val);
  });

  return out;
}

function extractNameByRole(rawQuery, role) {
  const q = (rawQuery || "").trim();
  const m = q.match(/^(.*?)\s+x\s+(.*)$/i);

  if (!m) return q;

  const studentPart = (m[1] || "").trim();
  const tutorPart = (m[2] || "").trim();

  if (role === "student") return studentPart || null;
  return tutorPart || null;
}

function showChoicesModal(choices, onPick, onCancel, { titleText, subText, modalId } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "modalOverlay";
  overlay.id = modalId || "nameChoiceModal";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const modal = document.createElement("div");
  modal.className = "modal";

  const header = document.createElement("div");
  header.className = "modalHeader";

  const h = document.createElement("p");
  h.className = "modalTitle";
  h.textContent = titleText || "Which person do you mean?";

  const sub = document.createElement("p");
  sub.className = "modalSub";
  sub.textContent = subText || `Select the correct name to show ${dayWord()}'s lessons.`;

  header.appendChild(h);
  header.appendChild(sub);

  const body = document.createElement("div");
  body.className = "modalBody";

  const grid = document.createElement("div");
  grid.className = "choiceGrid";

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.type = "button";
    btn.textContent = choice;
    btn.addEventListener("click", () => onPick(choice));
    grid.appendChild(btn);
  });

  const actions = document.createElement("div");
  actions.className = "modalActions";

  const cancel = document.createElement("button");
  cancel.className = "btnSecondary";
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => onCancel());

  actions.appendChild(cancel);

  body.appendChild(grid);
  body.appendChild(actions);
  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  overlay.addEventListener("click", e => {
    if (e.target === overlay) onCancel();
  });

  document.body.appendChild(overlay);
  return overlay;
}

// ===== Floor board =====

function refreshBoard() {
  loadBoard();
}

async function loadBoard({ silent } = {}) {
  const board = document.getElementById("board");
  const dateLabel = document.getElementById("boardDateLabel");
  const refreshBtn = document.getElementById("boardRefreshBtn");

  if (!board) return;

  cancelBoardRefresh();

  if (!silent) {
    board.innerHTML = "";
    board.appendChild(renderLoading("Loading floor board…"));
    if (dateLabel) dateLabel.textContent = `Loading ${dayWord()}’s schedule…`;
  }

  if (refreshBtn) refreshBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}?mode=board${dayQueryParam()}${accessQueryParam()}`);
    const data = await res.json();

    if (data?.error || !data || !data.floors) {
      throw new Error(data?.error || "Invalid board payload");
    }

    boardData = data;
    if (data.day === "today" || data.day === "tomorrow") {
      selectedDay = data.day;
    }
    updateDayNavUI();
    if (data.date) {
      const boardDate = document.getElementById("boardDateLabel");
      if (boardDate) boardDate.textContent = formatBoardDate(data.date);
    }

    const preferred = BOARD_FLOORS.find(f => (data.floors[f] || []).length > 0);
    if (preferred && !(boardData.floors[activeFloor] || []).length) {
      setActiveFloor(preferred);
    } else {
      setActiveFloor(activeFloor);
    }

    renderBoard();
    scheduleBoardRefresh();
  } catch (err) {
    console.error(err);
    board.innerHTML = "";
    board.appendChild(
      renderEmpty("Could not load floor board", "Check the Apps Script deploy, then tap Refresh.")
    );
    if (dateLabel) dateLabel.textContent = "Unavailable";
    scheduleBoardRefresh();
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

function renderBoard() {
  const board = document.getElementById("board");
  if (!board) return;

  board.innerHTML = "";

  if (!boardData || !boardData.floors) {
    board.appendChild(renderEmpty("No data", "Open Floor board again to reload."));
    return;
  }

  const lessons = [...(boardData.floors[activeFloor] || [])].sort(
    (a, b) => new Date(a.start) - new Date(b.start)
  );

  if (!lessons.length) {
    board.appendChild(
      renderEmpty(
        `No on-site lessons on ${activeFloor}/F ${dayWord()}.`,
        "Try another floor or day, or use Find my lesson."
      )
    );
    return;
  }

  const schedule = document.createElement("div");
  schedule.className = "scheduleList";

  const colHead = document.createElement("div");
  colHead.className = "scheduleHead";
  colHead.innerHTML = `
    <span>Time</span>
    <span>Lesson</span>
    <span>Room</span>
  `;
  schedule.appendChild(colHead);

  lessons.forEach(lesson => {
    schedule.appendChild(createScheduleRow(lesson));
  });

  board.appendChild(schedule);
}

function createScheduleRow(lesson) {
  const row = document.createElement("div");
  row.className = "scheduleRow";

  const time = document.createElement("div");
  time.className = "scheduleTime";
  time.textContent = formatBoardTimeRange(lesson.start, lesson.end);

  const name = document.createElement("div");
  name.className = "scheduleName";
  name.textContent =
    String(lesson.title || "").trim() ||
    cleanBoardStudentName(lesson.student) ||
    "Lesson";

  const room = document.createElement("div");
  room.className = "scheduleRoom";
  const code = document.createElement("span");
  code.className = "scheduleRoomCode";
  code.textContent = lesson.room || "TBC";
  room.appendChild(code);

  row.appendChild(time);
  row.appendChild(name);
  row.appendChild(room);
  return row;
}

function cleanBoardStudentName(raw) {
  const val = String(raw || "").trim();
  if (!val) return "";
  const lower = val.toLowerCase();
  // Guard against old API payloads that returned subject fragments.
  if (/^(igcse|gcse|ib|alevel|cie)\b/i.test(val)) return "Group class";
  if (lower === "lesson" || lower === "group class") return "Group class";
  return val;
}

// ===== 13/F Availability =====

const AVAIL_TIME_OPTIONS = (() => {
  const out = [];
  for (let t = 9 * 60; t <= 21 * 60; t += 30) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return out;
})();

function getAvailToken() {
  return sessionStorage.getItem(AVAIL_TOKEN_SESSION_KEY) || "";
}

function setAvailToken(token) {
  if (token) sessionStorage.setItem(AVAIL_TOKEN_SESSION_KEY, token);
  else sessionStorage.removeItem(AVAIL_TOKEN_SESSION_KEY);
}

function clearAvailToken() {
  sessionStorage.removeItem(AVAIL_TOKEN_SESSION_KEY);
}

function availTokenQueryParam() {
  const token = getAvailToken();
  return token ? `&token=${encodeURIComponent(token)}` : "";
}

function todayDateInputValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fillTimeSelect(selectEl, selected) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  AVAIL_TIME_OPTIONS.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    if (t === selected) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function ensureAvailControlsReady() {
  if (availControlsReady) return;
  const dateInput = document.getElementById("availDate");
  const startSelect = document.getElementById("availStart");
  const endSelect = document.getElementById("availEnd");
  if (!dateInput || !startSelect || !endSelect) return;

  if (!dateInput.value) dateInput.value = todayDateInputValue();
  fillTimeSelect(startSelect, "09:00");
  fillTimeSelect(endSelect, "18:00");
  availControlsReady = true;
}

function getAvailQuery() {
  ensureAvailControlsReady();
  const date = document.getElementById("availDate")?.value || todayDateInputValue();
  let start = document.getElementById("availStart")?.value || "09:00";
  let end = document.getElementById("availEnd")?.value || "18:00";

  const toMin = hhmm => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  if (toMin(end) <= toMin(start)) {
    end = "18:00";
    if (toMin(end) <= toMin(start)) start = "09:00";
    const startSelect = document.getElementById("availStart");
    const endSelect = document.getElementById("availEnd");
    if (startSelect) startSelect.value = start;
    if (endSelect) endSelect.value = end;
  }

  return { date, start, end };
}

function updateAvailAuthUI(unlocked) {
  const gate = document.getElementById("availGate");
  const content = document.getElementById("availContent");
  const logoutBtn = document.getElementById("availLogoutBtn");
  const refreshBtn = document.getElementById("availRefreshBtn");
  const sub = document.getElementById("availSub");

  if (gate) gate.hidden = !!unlocked;
  if (content) content.hidden = !unlocked;
  if (logoutBtn) logoutBtn.hidden = !unlocked;
  if (refreshBtn) refreshBtn.hidden = !unlocked;
  if (sub) {
    sub.textContent = unlocked
      ? "Helios calendar — CEO Room & 1309A–E, G"
      : "Password required · Helios calendar";
  }
}

function enterAvailabilityMode() {
  ensureAvailControlsReady();
  if (!getAvailToken()) {
    updateAvailAuthUI(false);
    promptAvailPassword();
    return;
  }
  updateAvailAuthUI(true);
  loadAvailability();
}

function promptAvailPassword() {
  document.querySelectorAll(".modalOverlay[data-avail-login]").forEach(el => el.remove());

  const overlay = document.createElement("div");
  overlay.className = "modalOverlay";
  overlay.setAttribute("data-avail-login", "1");

  const modal = document.createElement("div");
  modal.className = "modal availLoginModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "availLoginTitle");

  modal.innerHTML = `
    <div class="modalHeader">
      <p class="modalTitle" id="availLoginTitle">13/F Availability</p>
      <p class="modalSub">Enter password to view live room status</p>
    </div>
    <form class="modalBody availLoginForm" id="availLoginForm" autocomplete="off">
      <div class="field">
        <label for="availPassword">Password</label>
        <input id="availPassword" type="password" name="avail-password" inputmode="numeric" autocomplete="off" required />
      </div>
      <p class="availLoginError" id="availLoginError" hidden></p>
      <div class="modalActions availLoginActions">
        <button type="button" class="btnSecondary" id="availLoginCancel">Cancel</button>
        <button type="submit" id="availLoginSubmit">Unlock</button>
      </div>
    </form>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const input = modal.querySelector("#availPassword");
  const errEl = modal.querySelector("#availLoginError");
  const form = modal.querySelector("#availLoginForm");
  const cancelBtn = modal.querySelector("#availLoginCancel");
  const submitBtn = modal.querySelector("#availLoginSubmit");

  const close = () => overlay.remove();

  cancelBtn?.addEventListener("click", () => {
    close();
    if (!getAvailToken()) updateAvailAuthUI(false);
  });

  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      close();
      if (!getAvailToken()) updateAvailAuthUI(false);
    }
  });

  form?.addEventListener("submit", async e => {
    e.preventDefault();
    const password = (input?.value || "").trim();
    if (!password) return;

    if (submitBtn) submitBtn.disabled = true;
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = "";
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "loginAvailability",
          key: STAFF_KEY,
          password
        })
      });
      const data = await res.json();
      if (!data?.ok || !data?.token) {
        throw new Error(data?.error || "Incorrect password");
      }
      setAvailToken(data.token);
      close();
      updateAvailAuthUI(true);
      loadAvailability();
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = err.message || "Incorrect password";
      }
      input?.focus();
      input?.select();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  setTimeout(() => input?.focus(), 30);
}

function scheduleAvailRefresh() {
  cancelAvailRefresh();
  availRefreshTimerId = setTimeout(() => {
    availRefreshTimerId = null;
    if (currentMode === "availability" && getAvailToken()) {
      loadAvailability({ silent: true });
    }
  }, AVAIL_REFRESH_MS);
}

async function loadAvailability(opts = {}) {
  if (!staffMode) return;
  if (!getAvailToken()) {
    updateAvailAuthUI(false);
    if (!opts.silent) promptAvailPassword();
    return;
  }

  const nowCards = document.getElementById("availNowCards");
  const summary = document.getElementById("availSummary");
  const gridWrap = document.getElementById("availGridWrap");
  const checkBtn = document.getElementById("availCheckBtn");
  const refreshBtn = document.getElementById("availRefreshBtn");
  if (!summary || !gridWrap || !nowCards) return;

  const q = getAvailQuery();
  if (checkBtn) checkBtn.disabled = true;
  if (refreshBtn) refreshBtn.disabled = true;

  if (!opts.silent) {
    nowCards.innerHTML = "";
    summary.innerHTML = "";
    gridWrap.innerHTML = "";
    nowCards.appendChild(renderLoading("Loading live room status…"));
  }

  try {
    const url =
      `${API_URL}?mode=availability` +
      `&date=${encodeURIComponent(q.date)}` +
      `&start=${encodeURIComponent(q.start)}` +
      `&end=${encodeURIComponent(q.end)}` +
      accessQueryParam() +
      availTokenQueryParam();

    const res = await fetch(url);
    const data = await res.json();

    if (data?.authRequired) {
      clearAvailToken();
      updateAvailAuthUI(false);
      nowCards.innerHTML = "";
      summary.innerHTML = "";
      gridWrap.innerHTML = "";
      if (!opts.silent) promptAvailPassword();
      return;
    }

    if (data?.error || !data?.rooms) {
      throw new Error(data?.error || "Invalid availability payload");
    }

    availData = data;
    renderAvailability(data);
    scheduleAvailRefresh();
  } catch (err) {
    nowCards.innerHTML = "";
    summary.innerHTML = "";
    gridWrap.innerHTML = "";
    summary.appendChild(
      renderEmpty(
        "Could not load availability",
        "Set AVAILABILITY_PASSWORD in Script Properties, share Helios calendar, redeploy, then unlock again."
      )
    );
  } finally {
    if (checkBtn) checkBtn.disabled = false;
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

function renderAvailability(data) {
  const nowCards = document.getElementById("availNowCards");
  const nowMeta = document.getElementById("availNowMeta");
  const summary = document.getElementById("availSummary");
  const gridWrap = document.getElementById("availGridWrap");
  if (!nowCards || !summary || !gridWrap) return;

  nowCards.innerHTML = "";
  summary.innerHTML = "";
  gridWrap.innerHTML = "";

  if (nowMeta) {
    nowMeta.textContent = `As of ${data.now} · tap a room for today’s calendar`;
  }

  (data.rooms || []).forEach(room => {
    nowCards.appendChild(createAvailNowCard(room, data));
  });

  const windowLabel = document.createElement("p");
  windowLabel.className = "availWindowLabel";
  windowLabel.textContent = `${data.date} · ${data.start}–${data.end}`;
  summary.appendChild(windowLabel);

  const list = document.createElement("div");
  list.className = "availRoomList";

  (data.rooms || []).forEach(room => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `availRoomRow is-${room.status || "available"}`;
    row.setAttribute("aria-label", `${room.label || room.id} ${room.status}`);

    const top = document.createElement("div");
    top.className = "availRoomTop";

    const name = document.createElement("span");
    name.className = "availRoomName";
    name.textContent = room.label || room.id;

    const badge = document.createElement("span");
    badge.className = "availStatusBadge";
    badge.textContent = room.status === "busy" ? "Busy" : "Free";

    top.appendChild(name);
    top.appendChild(badge);
    row.appendChild(top);

    const detail = document.createElement("p");
    detail.className = "availRoomDetail";
    if (room.status === "busy" && Array.isArray(room.events) && room.events.length) {
      const first = room.events[0];
      const time = `${first.start || ""}–${first.end || ""}`.replace(/^–|–$/g, "");
      detail.textContent =
        room.events.length === 1
          ? `${time || "Busy"} · ${first.title || "View schedule"}`
          : `${room.events.length} bookings in this window · View schedule`;
    } else {
      detail.textContent = "Free for the selected time · View schedule";
    }
    row.appendChild(detail);

    row.addEventListener("click", () => openRoomDayCalendar(room.id, data));
    list.appendChild(row);
  });

  summary.appendChild(list);
  renderAvailOverviewGrid(data, gridWrap);
}

function createAvailNowCard(room, data) {
  const now = room.now;
  const status = now?.status || "available";
  const card = document.createElement("button");
  card.type = "button";
  card.className = `availNowCard is-${status === "busy" ? "busy" : "available"}`;
  card.setAttribute("role", "listitem");

  const name = document.createElement("p");
  name.className = "availNowName";
  name.textContent = room.label || room.id;

  const state = document.createElement("p");
  state.className = "availNowState";
  state.textContent = status === "busy" ? "BUSY" : "FREE";

  const summary = document.createElement("p");
  summary.className = "availNowSummary";
  summary.textContent = now?.summary || "Free for the rest of today";

  card.appendChild(name);
  card.appendChild(state);
  card.appendChild(summary);

  if (status === "busy" && now?.eventTitle) {
    const ev = document.createElement("p");
    ev.className = "availNowEvent";
    ev.textContent = now.eventTitle;
    card.appendChild(ev);
  }

  card.addEventListener("click", () => openRoomDayCalendar(room.id, data, { useToday: true }));
  return card;
}

function renderAvailOverviewGrid(data, gridWrap) {
  const slots = data.slots || [];
  const grid = data.grid || {};
  const gridMeta = data.gridMeta || {};
  const roomIds = (data.rooms || []).map(r => r.id);
  if (!slots.length || !roomIds.length) return;

  const scroller = document.createElement("div");
  scroller.className = "availGridScroll";

  const table = document.createElement("div");
  table.className = "availGrid";
  table.style.setProperty("--avail-cols", String(slots.length));

  const head = document.createElement("div");
  head.className = "availGridHead";
  const corner = document.createElement("div");
  corner.className = "availGridCorner";
  corner.textContent = "Room";
  head.appendChild(corner);
  slots.forEach(slot => {
    const cell = document.createElement("div");
    cell.className = "availGridTime";
    cell.title = slot;
    cell.textContent = slot.endsWith(":00") ? String(parseInt(slot, 10)) : "";
    head.appendChild(cell);
  });
  table.appendChild(head);

  roomIds.forEach(id => {
    const row = document.createElement("div");
    row.className = "availGridRow";

    const label = document.createElement("button");
    label.type = "button";
    label.className = "availGridRoom";
    const room = (data.rooms || []).find(r => r.id === id);
    label.textContent = room?.label || id;
    label.addEventListener("click", () => openRoomDayCalendar(id, data));
    row.appendChild(label);

    const busyFlags = grid[id] || [];
    const metaRow = gridMeta[id] || [];
    slots.forEach((_, idx) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "availGridCell";
      const busy = !!busyFlags[idx];
      cell.classList.toggle("is-busy", busy);
      cell.classList.toggle("is-free", !busy);
      const meta = metaRow[idx];
      const slotLabel = slots[idx];
      if (busy && meta) {
        cell.title = `${meta.start}–${meta.end} · ${meta.title}`;
        cell.setAttribute("aria-label", `${id} busy at ${slotLabel}: ${meta.title}`);
      } else {
        cell.title = busy ? `${id} busy at ${slotLabel}` : `${id} free at ${slotLabel}`;
        cell.setAttribute("aria-label", cell.title);
      }
      cell.addEventListener("click", () => openRoomDayCalendar(id, data));
      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  scroller.appendChild(table);
  gridWrap.appendChild(scroller);
}

function hhmmToMinutes(hhmm) {
  const parts = String(hhmm || "").split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function layoutRoomDayEvents(events) {
  const sorted = (events || [])
    .map(event => ({
      ...event,
      startMin: Math.max(hhmmToMinutes(event.start), AVAIL_GRID_START_MIN),
      endMin: Math.min(hhmmToMinutes(event.end), AVAIL_GRID_END_MIN)
    }))
    .filter(event => event.endMin > event.startMin)
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const groups = [];
  let group = null;

  sorted.forEach(event => {
    if (!group || event.startMin >= group.endMin) {
      group = { endMin: event.endMin, events: [event] };
      groups.push(group);
      return;
    }

    group.events.push(event);
    group.endMin = Math.max(group.endMin, event.endMin);
  });

  return groups.flatMap(({ events: groupEvents }) => {
    const active = [];
    let columnCount = 1;

    groupEvents.forEach(event => {
      for (let i = active.length - 1; i >= 0; i -= 1) {
        if (active[i].endMin <= event.startMin) active.splice(i, 1);
      }

      const usedColumns = new Set(active.map(item => item.column));
      let column = 0;
      while (usedColumns.has(column)) column += 1;

      event.column = column;
      active.push(event);
      columnCount = Math.max(columnCount, column + 1);
    });

    return groupEvents.map(event => ({ ...event, columnCount }));
  });
}

function openRoomDayCalendar(roomId, data, opts = {}) {
  const room = (data.rooms || []).find(r => r.id === roomId);
  if (!room) return;

  const useToday = !!opts.useToday;
  const viewDate = useToday ? data.today || data.date : data.date;
  const viewEvents = useToday
    ? Array.isArray(room.todayEvents)
      ? room.todayEvents
      : room.dayEvents || []
    : room.dayEvents || [];
  const showNowLine = useToday || !!data.isToday;

  document.querySelectorAll(".modalOverlay[data-room-cal]").forEach(el => el.remove());

  const overlay = document.createElement("div");
  overlay.className = "modalOverlay";
  overlay.setAttribute("data-room-cal", "1");

  const modal = document.createElement("div");
  modal.className = "modal availDayModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const header = document.createElement("div");
  header.className = "modalHeader";
  const titleEl = document.createElement("p");
  titleEl.className = "modalTitle";
  titleEl.textContent = room.label || room.id;
  const subEl = document.createElement("p");
  subEl.className = "modalSub";
  subEl.textContent = `${viewDate} · ${data.gridStart || "09:00"}–${data.gridEnd || "21:00"}`;
  header.appendChild(titleEl);
  header.appendChild(subEl);

  const body = document.createElement("div");
  body.className = "modalBody availDayBody";
  body.appendChild(
    buildRoomDayTimeline(
      { ...room, dayEvents: viewEvents },
      { ...data, date: viewDate, isToday: showNowLine }
    )
  );

  const actions = document.createElement("div");
  actions.className = "modalActions";
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btnSecondary";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => overlay.remove());
  actions.appendChild(closeBtn);

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.remove();
  });
}

function buildRoomDayTimeline(room, data) {
  const wrap = document.createElement("div");
  wrap.className = "availDayTimeline";

  const totalMins = AVAIL_GRID_END_MIN - AVAIL_GRID_START_MIN;
  const height = Math.round(totalMins * AVAIL_PX_PER_MIN);
  wrap.style.height = `${height}px`;

  const hours = document.createElement("div");
  hours.className = "availDayHours";
  for (let t = AVAIL_GRID_START_MIN; t < AVAIL_GRID_END_MIN; t += 60) {
    const label = document.createElement("div");
    label.className = "availDayHour";
    label.style.top = `${(t - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
    const h = Math.floor(t / 60);
    label.textContent = `${h}:00`;
    hours.appendChild(label);

    const line = document.createElement("div");
    line.className = "availDayHourLine";
    line.style.top = `${(t - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
    wrap.appendChild(line);
  }
  wrap.appendChild(hours);

  const track = document.createElement("div");
  track.className = "availDayTrack";

  const events = layoutRoomDayEvents(
    Array.isArray(room.dayEvents) ? room.dayEvents : []
  );
  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "availDayEmpty";
    empty.textContent = "No bookings on this day";
    track.appendChild(empty);
  } else {
    events.forEach(ev => {
      const block = document.createElement("button");
      block.type = "button";
      block.className = "availDayEvent";
      const durationPx = (ev.endMin - ev.startMin) * AVAIL_PX_PER_MIN;
      block.style.top = `${(ev.startMin - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
      block.style.height = `${Math.max(22, durationPx)}px`;
      block.style.setProperty("--event-col", String(ev.column));
      block.style.setProperty("--event-cols", String(ev.columnCount));
      block.classList.toggle("is-compact", durationPx < 48);

      const time = document.createElement("span");
      time.className = "availDayEventTime";
      time.textContent = `${ev.start}–${ev.end}`;

      const title = document.createElement("span");
      title.className = "availDayEventTitle";
      title.textContent = ev.title || "Busy";

      block.appendChild(time);
      block.appendChild(title);
      block.title = `${ev.start}–${ev.end} · ${ev.title || "Busy"}`;
      block.addEventListener("click", e => {
        e.stopPropagation();
        showAvailEventDetails(room, ev, data.date);
      });
      track.appendChild(block);
    });
  }

  wrap.appendChild(track);

  if (data.isToday && data.now) {
    const nowMin = hhmmToMinutes(data.now);
    if (nowMin >= AVAIL_GRID_START_MIN && nowMin <= AVAIL_GRID_END_MIN) {
      const nowLine = document.createElement("div");
      nowLine.className = "availDayNowLine";
      nowLine.style.top = `${(nowMin - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
      nowLine.setAttribute("aria-hidden", "true");
      wrap.appendChild(nowLine);
    }
  }

  return wrap;
}

function showAvailEventDetails(room, ev, dateStr) {
  document.querySelectorAll(".modalOverlay[data-event-detail]").forEach(el => el.remove());

  const overlay = document.createElement("div");
  overlay.className = "modalOverlay";
  overlay.setAttribute("data-event-detail", "1");
  overlay.style.zIndex = "60";

  const modal = document.createElement("div");
  modal.className = "modal";

  const header = document.createElement("div");
  header.className = "modalHeader";
  const titleEl = document.createElement("p");
  titleEl.className = "modalTitle";
  titleEl.textContent = ev.title || "Busy";
  const subEl = document.createElement("p");
  subEl.className = "modalSub";
  subEl.textContent = `${room.label || room.id} · ${dateStr}`;
  header.appendChild(titleEl);
  header.appendChild(subEl);

  const body = document.createElement("div");
  body.className = "modalBody";
  const kv = document.createElement("div");
  kv.className = "kv";
  kv.appendChild(kvItem("Time", `${ev.start || "?"} – ${ev.end || "?"}`));
  kv.appendChild(kvItem("Room", room.label || room.id));
  body.appendChild(kv);

  const actions = document.createElement("div");
  actions.className = "modalActions";
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btnSecondary";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => overlay.remove());
  actions.appendChild(closeBtn);

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.remove();
  });
}

initModeSwitch();
initDayNav();
applyAccessMode();
ensureAvailControlsReady();
updateAvailAuthUI(!!getAvailToken());
