const API_URL = "https://script.google.com/macros/s/AKfycbyOkNPd7RTUgtISDDqy8B8VLtJtgF_myu84RXbfzRihD1G1QmJQu2cPeJW1iMVf5PxZow/exec";
/** Must match keys in Code.gs. Change both sides when rotating. */
const STAFF_KEY = "achievers-wc-staff-2026";
const TUTOR_KEY = "achievers-tutor";
const STAFF_SESSION_KEY = "achievers_staff_key";
const TUTOR_SESSION_KEY = "achievers_tutor_key";

const RESULTS_RESET_MS = 60 * 1000;
const BOARD_REFRESH_MS = 60 * 1000;
const BOARD_FLOORS = ["13", "10", "8"];

const HELP_PHONE = "+852 5727 1209";
const HELP_ADDRESS = "Room 1012, 10/F, Tai Yau Building, 181 Johnston Road, Wan Chai";

const STUDENT_HELP = {
  title: "Can't find your room?",
  body: `Please visit the Room Management Desktop at ${HELP_ADDRESS} to check today’s floor board.`,
  contact: `Still stuck? Call ${HELP_PHONE}.`
};

const TUTOR_HELP = {
  title: "Can't find your lesson room?",
  body: `Please visit the Room Management Desktop at ${HELP_ADDRESS} to check today’s floor board.`,
  contact: `Need help? Call ${HELP_PHONE}.`
};

let resultsResetTimerId = null;
let boardRefreshTimerId = null;
let boardData = null;
let activeFloor = "13";
let currentMode = "search";
let staffMode = false;
let tutorMode = false;
/** "today" | "tomorrow" — shared by search + floor board */
let selectedDay = "today";
let lastSearchQuery = null;
let lastSearchRole = "student";

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
    if (subtitle) subtitle.textContent = "Staff mode — search or open the floor board.";
    if (nameLabel) nameLabel.textContent = "Student / Tutor name";
    if (nameInput) nameInput.placeholder = "Enter student or tutor name (e.g. Peter Chan)";
  } else if (tutorMode) {
    if (subtitle) subtitle.textContent = "Tutor mode — search your name to find today’s rooms.";
    if (nameLabel) nameLabel.textContent = "Your tutor name";
    if (nameInput) nameInput.placeholder = "e.g. Robert Cairns or Jay";
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

  el.appendChild(title);
  el.appendChild(body);
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
  if (mode === "board" && !staffMode) {
    mode = "search";
  }

  currentMode = mode === "board" ? "board" : "search";

  const searchPanel = document.getElementById("searchPanel");
  const boardPanel = document.getElementById("boardPanel");
  const searchBtn = document.getElementById("modeSearchBtn");
  const boardBtn = document.getElementById("modeBoardBtn");

  const isSearch = currentMode === "search";

  if (searchPanel) searchPanel.hidden = !isSearch;
  if (boardPanel) boardPanel.hidden = isSearch || !staffMode;

  searchBtn?.classList.toggle("is-active", isSearch);
  boardBtn?.classList.toggle("is-active", !isSearch);
  searchBtn?.setAttribute("aria-selected", String(isSearch));
  boardBtn?.setAttribute("aria-selected", String(!isSearch));

  if (isSearch) {
    cancelBoardRefresh();
  } else {
    cancelResultsReset();
    document.querySelectorAll(".modalOverlay").forEach(el => el.remove());
    loadBoard();
  }
}

function initModeSwitch() {
  document.getElementById("modeSearchBtn")?.addEventListener("click", () => setMode("search"));
  document.getElementById("modeBoardBtn")?.addEventListener("click", () => {
    if (!staffMode) return;
    setMode("board");
  });

  document.getElementById("floorTabs")?.addEventListener("click", e => {
    const tab = e.target.closest(".floorTab");
    if (!tab) return;
    const floor = tab.getAttribute("data-floor");
    if (!floor) return;
    setActiveFloor(floor);
    renderBoard();
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

initModeSwitch();
initDayNav();
applyAccessMode();
