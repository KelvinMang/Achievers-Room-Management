const API_URL = "https://script.google.com/macros/s/AKfycbzMc2mM31g_TS_TNgAkl03zJ6a11I64a4czw6D04pqfD3hywFWpbbzLky0-WP2HacO1yg/exec";
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
const AVAIL_PX_PER_MIN = 1.45;

const HELP_PHONE_ACHIEVERS = "+852 5727 1209";
const HELP_PHONE_HELIOS = "+852 9229 6725";

const HELP_OFFICES = [
  {
    branch: "Wan Chai",
    lines: [
      "Room 1012, 10/F, Tai Yau Building, 181 Johnston Road",
      "Room 1309, 13/F, Tai Yau Building, 181 Johnston Road"
    ]
  },
  {
    branch: "Prince Edward",
    lines: ["Room 309, Summit Insurance Building, 789 Nathan Road"]
  }
];

const HELP_CONTACTS = [
  { org: "Achievers", phone: HELP_PHONE_ACHIEVERS },
  { org: "Helios", phone: HELP_PHONE_HELIOS }
];

const STUDENT_HELP = {
  title: "Can't find your room?",
  body: "Helios and Achievers share the same classrooms. Visit a Room Management Desktop at either office to check today’s floor board.",
  note: ""
};

const TUTOR_HELP = {
  title: "Can't find your lesson room?",
  body: "Helios and Achievers share the same classrooms. Visit a Room Management Desktop at either office to check today’s floor board.",
  note: ""
};

const STAFF_HELP = {
  title: "Office locations & who to call",
  body: "Call Achievers or Helios depending on which company they belong to.",
  note: "Rooms can change occasionally — please double-check the room before class."
};

const LANG_STORAGE_KEY = "achievers_student_lang";
const LANG_ZH = "zh-Hant";
const LANG_EN = "en";

const I18N_EN = {
  docTitle: "Student version · Helios & Achievers Lesson Finder",
  appTitle: "Student Lesson Finder",
  versionTitle: "Student version",
  versionDetail: "This page searches student names only — not tutor names.",
  subtitle: "Search your student name to find today’s room.",
  nameLabel: "Enter student name",
  namePlaceholder: "e.g. Peter Chan",
  search: "Search",
  refresh: "Refresh",
  today: "Today",
  tomorrow: "Tomorrow",
  warnKicker: "Important",
  warnTitle: "Rooms change occasionally",
  warnBefore: "Please only check your room ",
  warnStrong: "within 5 hours of your lesson",
  warnAfter: " so you get the right room number. If you checked earlier, check again just before class.",
  helpTitle: "Can't find your room?",
  helpBody: "Helios and Achievers share the same classrooms. Visit a Room Management Desktop at either office to check today’s floor board.",
  helpOffices: "Offices",
  helpCall: "Call Achievers or Helios",
  branchWc: "Wan Chai",
  branchPe: "Prince Edward",
  officeWc1: "Room 1012, 10/F, Tai Yau Building, 181 Johnston Road",
  officeWc2: "Room 1309, 13/F, Tai Yau Building, 181 Johnston Road",
  officePe: "Room 309, Summit Insurance Building, 789 Nathan Road",
  enterName: "Enter your name",
  enterNameSub: "Type your name and press Search. If a few people match, you’ll pick yours.",
  nameTooShort: "Name too short",
  nameTooShortSub: "Enter at least 3 letters of your name.",
  noLessons: "No lessons {day}",
  tryAnother: "Please try another name.",
  tryAnotherOrDay: "Please try another name, or switch day.",
  cancelled: "Cancelled",
  selectName: "Select a name to continue.",
  couldNotSearch: "Could not search",
  errorLoading: "Error loading data",
  tryAgain: "Please try again in a moment.",
  whichPerson: "Which person do you mean?",
  selectForLessons: "Select the correct name to show {day}'s lessons.",
  cancel: "Cancel",
  location: "Location",
  room: "Room",
  online: "Online",
  onsite: "On-site",
  wanChai: "Wan Chai",
  princeEdward: "Prince Edward",
  tbc: "TBC",
  loading: "Loading...",
  previousDay: "Previous day",
  nextDay: "Next day"
};

const I18N_ZH = {
  docTitle: "學生版 · Helios & Achievers 課堂查詢",
  appTitle: "學生課堂查詢",
  versionTitle: "學生版",
  versionDetail: "此頁只可搜尋學生姓名，不能搜尋導師姓名。",
  subtitle: "輸入學生姓名，查詢今日課室。",
  nameLabel: "輸入學生姓名",
  namePlaceholder: "例如 Peter Chan",
  search: "搜尋",
  refresh: "重新整理",
  today: "今天",
  tomorrow: "明天",
  warnKicker: "重要提示",
  warnTitle: "課室或會臨時更改",
  warnBefore: "請只在",
  warnStrong: "上課前 5 小時內",
  warnAfter: "查詢課室，以確保課室編號正確。如你較早前已查過，上課前請再查一次。",
  helpTitle: "找不到課室？",
  helpBody: "Helios 與 Achievers 共用課室。請到任何一間辦公室的課室管理電腦查閱當日樓層表。",
  helpOffices: "辦公室",
  helpCall: "致電 Achievers 或 Helios",
  branchWc: "灣仔",
  branchPe: "太子",
  officeWc1: "灣仔莊士敦道181號大有大廈10樓1012室",
  officeWc2: "灣仔莊士敦道181號大有大廈13樓1309室",
  officePe: "彌敦道789號始創保險大廈309室",
  enterName: "請輸入姓名",
  enterNameSub: "輸入學生姓名後按「搜尋」。如有多個相同姓名，請再選擇。",
  nameTooShort: "姓名太短",
  nameTooShortSub: "請輸入至少 3 個英文字母。",
  noLessons: "{day}沒有課堂",
  tryAnother: "請試另一個姓名。",
  tryAnotherOrDay: "請試另一個姓名，或轉另一天。",
  cancelled: "已取消",
  selectName: "請選擇姓名以繼續。",
  couldNotSearch: "未能搜尋",
  errorLoading: "未能載入資料",
  tryAgain: "請稍後再試。",
  whichPerson: "你是指哪一位？",
  selectForLessons: "請選擇正確姓名，以顯示{day}的課堂。",
  cancel: "取消",
  location: "地點",
  room: "課室",
  online: "網上",
  onsite: "面授",
  wanChai: "灣仔",
  princeEdward: "太子",
  tbc: "待定",
  loading: "載入中…",
  previousDay: "前一天",
  nextDay: "後一天"
};

let studentLang = LANG_ZH;

function isStudentUi() {
  return !staffMode && !tutorMode;
}

function useZh() {
  return isStudentUi() && studentLang === LANG_ZH;
}

function t(key) {
  const pack = useZh() ? I18N_ZH : I18N_EN;
  return pack[key] || I18N_EN[key] || key;
}

function tDay(key) {
  const day = useZh()
    ? selectedDay === "tomorrow" ? "明天" : "今天"
    : selectedDay === "tomorrow" ? "tomorrow" : "today";
  return t(key).replace("{day}", day);
}

function loadStudentLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === LANG_EN || saved === LANG_ZH) studentLang = saved;
    else studentLang = LANG_ZH;
  } catch (err) {
    studentLang = LANG_ZH;
  }
}

function saveStudentLang(lang) {
  studentLang = lang === LANG_EN ? LANG_EN : LANG_ZH;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, studentLang);
  } catch (err) {
    /* ignore */
  }
}

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
let availQueryTimerId = null;
let availLiveNowMode = true;

function dayQueryParam() {
  return `&day=${encodeURIComponent(selectedDay)}`;
}

function dayWord() {
  return selectedDay === "tomorrow" ? "tomorrow" : "today";
}

function dayTitleWord() {
  if (useZh()) return selectedDay === "tomorrow" ? "明天" : "今天";
  return selectedDay === "tomorrow" ? "Tomorrow" : "Today";
}

function getDayDateObject(day) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  if (day === "tomorrow") d.setDate(d.getDate() + 1);
  return d;
}

function formatDayDateLabel(day) {
  return getDayDateObject(day).toLocaleDateString(useZh() ? "zh-HK" : undefined, {
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
  if (boardTitle) boardTitle.textContent = `${label}’s rooms — Helios & Achievers`;

  if (prevSearch) {
    prevSearch.disabled = isToday;
    prevSearch.setAttribute("aria-label", t("previousDay"));
  }
  if (nextSearch) {
    nextSearch.disabled = !isToday;
    nextSearch.setAttribute("aria-label", t("nextDay"));
  }
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
  const versionBanner = document.getElementById("versionBanner");
  const versionTitle = document.getElementById("versionBannerTitle");
  const versionDetail = document.getElementById("versionBannerDetail");
  const appTitle = document.getElementById("appTitle") || document.querySelector(".app-header .title");
  const subtitle = document.getElementById("appSubtitle");
  const nameLabel = document.getElementById("nameLabel");
  const nameInput = document.getElementById("name");
  const langSwitch = document.getElementById("langSwitch");

  const isStudent = !staffMode && !tutorMode;
  if (modeSwitch) modeSwitch.hidden = tutorMode;
  ["modeSearchBtn", "modeBoardBtn", "modeAvailBtn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.hidden = !staffMode;
  });
  document.body.classList.toggle("is-student", isStudent);
  document.body.classList.toggle("is-tutor", tutorMode);
  document.body.classList.toggle("is-staff", staffMode);
  if (langSwitch) langSwitch.hidden = !isStudent;

  if (staffMode) {
    document.documentElement.lang = "en";
    document.title = "Staff · Helios & Achievers Lesson Finder";
    if (appTitle) appTitle.textContent = "Lesson Finder";
    if (versionTitle) versionTitle.textContent = "Staff version";
    if (versionDetail) versionDetail.textContent = "Search a student or tutor, or open Floor board and Room availability.";
    if (subtitle) subtitle.textContent = "Shared Helios & Achievers campus — search, board, or rooms.";
    if (nameLabel) nameLabel.textContent = "Student / Tutor name";
    if (nameInput) nameInput.placeholder = "Enter student or tutor name (e.g. Peter Chan)";
    const searchBtn = document.getElementById("searchBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    if (searchBtn) searchBtn.textContent = "Search";
    if (refreshBtn) refreshBtn.textContent = "Refresh";
    applyRoomWarning(true);
  } else if (tutorMode) {
    document.documentElement.lang = "en";
    document.title = "Tutor version · Helios & Achievers Lesson Finder";
    if (appTitle) appTitle.textContent = "Tutor Lesson Finder";
    if (versionTitle) versionTitle.textContent = "Tutor version";
    if (versionDetail) versionDetail.textContent = "This page searches tutor names only — not student names.";
    if (subtitle) subtitle.textContent = "Search your tutor name to find today’s rooms.";
    if (nameLabel) nameLabel.textContent = "Enter tutor name";
    if (nameInput) nameInput.placeholder = "e.g. Kelvin Chan";
    const searchBtn = document.getElementById("searchBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    if (searchBtn) searchBtn.textContent = "Search";
    if (refreshBtn) refreshBtn.textContent = "Refresh";
    applyRoomWarning(true);
    setMode("search");
  } else {
    applyStudentLanguage();
    setMode("search");
  }
  if (versionBanner) versionBanner.hidden = false;
  const roomWarning = document.getElementById("roomWarning");
  if (roomWarning) roomWarning.hidden = staffMode;

  updatePortalHelp();
  updateDayNavUI();
  updateLangButtons();
}

function applyStudentLanguage() {
  document.documentElement.lang = useZh() ? "zh-Hant" : "en";
  document.title = t("docTitle");
  const appTitle = document.getElementById("appTitle");
  const subtitle = document.getElementById("appSubtitle");
  const versionTitle = document.getElementById("versionBannerTitle");
  const versionDetail = document.getElementById("versionBannerDetail");
  const nameLabel = document.getElementById("nameLabel");
  const nameInput = document.getElementById("name");
  const searchBtn = document.getElementById("searchBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  if (appTitle) appTitle.textContent = t("appTitle");
  if (subtitle) subtitle.textContent = t("subtitle");
  if (versionTitle) versionTitle.textContent = t("versionTitle");
  if (versionDetail) versionDetail.textContent = t("versionDetail");
  if (nameLabel) nameLabel.textContent = t("nameLabel");
  if (nameInput) nameInput.placeholder = t("namePlaceholder");
  if (searchBtn) searchBtn.textContent = t("search");
  if (refreshBtn) refreshBtn.textContent = t("refresh");
  applyRoomWarning(false);
}

function applyRoomWarning(forceEnglish) {
  const warnKicker = document.getElementById("roomWarningKicker");
  const warnTitle = document.getElementById("roomWarningTitle");
  const warnBody = document.getElementById("roomWarningBody");
  const pack = forceEnglish || !useZh() ? I18N_EN : I18N_ZH;
  if (warnKicker) warnKicker.textContent = pack.warnKicker;
  if (warnTitle) warnTitle.textContent = pack.warnTitle;
  if (warnBody) {
    warnBody.textContent = "";
    warnBody.append(pack.warnBefore);
    const strong = document.createElement("strong");
    strong.textContent = pack.warnStrong;
    warnBody.appendChild(strong);
    warnBody.append(pack.warnAfter);
  }
}

function updateLangButtons() {
  const zhBtn = document.getElementById("langZhBtn");
  const enBtn = document.getElementById("langEnBtn");
  zhBtn?.classList.toggle("is-active", studentLang === LANG_ZH);
  enBtn?.classList.toggle("is-active", studentLang === LANG_EN);
  zhBtn?.setAttribute("aria-pressed", String(studentLang === LANG_ZH));
  enBtn?.setAttribute("aria-pressed", String(studentLang === LANG_EN));
}

function initLangSwitch() {
  document.getElementById("langSwitch")?.addEventListener("click", e => {
    const btn = e.target.closest("[data-lang]");
    if (!btn || !isStudentUi()) return;
    const next = btn.getAttribute("data-lang");
    if (next !== LANG_EN && next !== LANG_ZH) return;
    if (next === studentLang) return;
    saveStudentLang(next);
    applyStudentLanguage();
    updateLangButtons();
    updatePortalHelp();
    updateDayNavUI();
    const nameInput = document.getElementById("name");
    const div = document.getElementById("results");
    const searchBtn = document.getElementById("searchBtn");
    const query = (lastSearchQuery || nameInput?.value || "").trim();
    if (query && div && searchBtn && nameInput) {
      runQuery(query, { nameInput, div, btn: searchBtn, role: lastSearchRole || "student" });
    }
  });
}

function currentHelpContent() {
  if (staffMode) return STAFF_HELP;
  if (tutorMode) return TUTOR_HELP;
  return {
    title: t("helpTitle"),
    body: t("helpBody"),
    note: ""
  };
}

function appendHelpHeading(el, text) {
  const h = document.createElement("p");
  h.className = "helpNoteSection";
  h.textContent = text;
  el.appendChild(h);
}

function fillHelpCard(el, content) {
  if (!el || !content) return;
  el.innerHTML = "";

  const title = document.createElement("p");
  title.className = "helpNoteTitle";
  title.textContent = content.title;
  el.appendChild(title);

  const body = document.createElement("p");
  body.className = "helpNoteBody";
  body.textContent = content.body;
  el.appendChild(body);

  const offices = useZh()
    ? [
        { branch: t("branchWc"), lines: [t("officeWc1"), t("officeWc2")] },
        { branch: t("branchPe"), lines: [t("officePe")] }
      ]
    : HELP_OFFICES;

  appendHelpHeading(el, isStudentUi() ? t("helpOffices") : "Offices");
  offices.forEach(office => {
    const block = document.createElement("div");
    block.className = "helpNoteOffice";

    const name = document.createElement("p");
    name.className = "helpNoteOfficeName";
    name.textContent = office.branch;
    block.appendChild(name);

    const list = document.createElement("ul");
    list.className = "helpNoteOfficeList";
    office.lines.forEach(line => {
      const li = document.createElement("li");
      li.textContent = line;
      list.appendChild(li);
    });
    block.appendChild(list);
    el.appendChild(block);
  });

  appendHelpHeading(el, isStudentUi() ? t("helpCall") : "Call Achievers or Helios");
  const phones = document.createElement("ul");
  phones.className = "helpNotePhones";
  HELP_CONTACTS.forEach(item => {
    const li = document.createElement("li");

    const who = document.createElement("span");
    who.className = "helpNotePhoneRole";
    who.textContent = item.org;

    const link = document.createElement("a");
    link.href = `tel:${item.phone.replace(/\s+/g, "")}`;
    link.textContent = item.phone;

    li.appendChild(who);
    li.appendChild(link);
    phones.appendChild(li);
  });
  el.appendChild(phones);

  if (content.note) {
    const note = document.createElement("p");
    note.className = "helpNoteBody helpNoteReminder";
    note.textContent = content.note;
    el.appendChild(note);
  }
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
  document.getElementById("availModeToggleBtn")?.addEventListener("click", () => {
    if (availLiveNowMode) enterAvailTimeslotMode();
    else resetAvailControlsToNow({ reload: true });
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
        isStudentUi() ? t("enterName") : "Enter your name",
        staffMode
          ? "Type a student or tutor name and press Search."
          : tutorMode
            ? "Type your tutor name and press Search."
            : t("enterNameSub")
      )
    );
    return;
  }

  if (!staffMode && !tutorMode && rawQuery.replace(/\s+/g, "").length < 3) {
    div.appendChild(
      renderEmpty(t("nameTooShort"), t("nameTooShortSub"))
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
  return d.toLocaleTimeString(useZh() ? "zh-HK" : undefined, {
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
    <span>${label || t("loading")}</span>
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

function displayLocation(raw) {
  const loc = String(raw || "").trim();
  if (!loc) return t("tbc");
  if (/wan chai/i.test(loc)) return t("wanChai");
  if (/prince edward/i.test(loc)) return t("princeEdward");
  return loc;
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
  time.textContent = start && end ? `${start} - ${end}` : t("tbc");

  top.appendChild(title);
  top.appendChild(time);

  const meta = document.createElement("div");
  meta.className = "metaRow";

  const badge = document.createElement("span");
  badge.className = `badge ${isOnline ? "online" : "onsite"}`;
  badge.innerHTML = `<span class="dot" aria-hidden="true"></span>${isOnline ? t("online") : t("onsite")}`;
  meta.appendChild(badge);

  const kv = document.createElement("div");
  kv.className = "kv";

  const location = displayLocation(e.location);
  const room = isOnline
    ? t("online")
    : e.roomFormatted && e.roomFormatted !== "TBC"
      ? e.roomFormatted
      : e.room || t("tbc");

  kv.appendChild(kvItem(t("location"), location));
  kv.appendChild(kvItem(t("room"), room));

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
          /3 letters/i.test(data.error)
            ? t("nameTooShort")
            : isStudentUi()
              ? t("couldNotSearch")
              : "Could not search",
          /3 letters/i.test(data.error) && isStudentUi() ? t("nameTooShortSub") : data.error
        )
      );
      showRefreshButton();
      return;
    }

    if (Array.isArray(data)) {
      div.innerHTML = "";
      if (!data.length) {
        div.appendChild(
          renderEmpty(
            isStudentUi() ? tDay("noLessons") : `No lessons ${dayWord()}`,
            isStudentUi() ? t("tryAnother") : "Please try another name."
          )
        );
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
          div.appendChild(
            renderEmpty(
              isStudentUi() ? t("cancelled") : "Cancelled",
              isStudentUi() ? t("selectName") : "Select a name to continue."
            )
          );
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
      div.appendChild(
        renderEmpty(
          isStudentUi() ? tDay("noLessons") : `No lessons ${dayWord()}`,
          isStudentUi() ? t("tryAnotherOrDay") : "Please try another name, or switch day."
        )
      );
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
    div.appendChild(
      renderEmpty(
        isStudentUi() ? t("errorLoading") : "Error loading data",
        isStudentUi() ? t("tryAgain") : "Please try again in a moment."
      )
    );
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
  h.textContent = titleText || t("whichPerson");

  const sub = document.createElement("p");
  sub.className = "modalSub";
  sub.textContent = subText || tDay("selectForLessons");

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
  cancel.textContent = t("cancel");
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

// ===== Room availability =====

const AVAIL_HIDDEN_ROOMS = new Set(["1012A"]);
const AVAIL_FLOOR_ORDER = [
  { id: "13", label: "13/F" },
  { id: "10", label: "10/F" },
  { id: "8", label: "8/F" }
];

function availRoomFloorId(roomId) {
  const id = String(roomId || "");
  if (id === "CEO" || /^1309/i.test(id)) return "13";
  if (/^1012/i.test(id)) return "10";
  if (/^804/i.test(id)) return "8";
  return null;
}

function visibleAvailRooms(rooms) {
  return (rooms || []).filter(room => room && !AVAIL_HIDDEN_ROOMS.has(room.id));
}

function groupAvailRoomsByFloor(rooms) {
  const groups = AVAIL_FLOOR_ORDER.map(floor => ({
    id: floor.id,
    label: floor.label,
    rooms: []
  }));
  const byId = Object.fromEntries(groups.map(g => [g.id, g]));

  visibleAvailRooms(rooms).forEach(room => {
    const floorId = availRoomFloorId(room.id);
    if (floorId && byId[floorId]) byId[floorId].rooms.push(room);
  });

  return groups.filter(g => g.rooms.length > 0);
}

function createAvailFloorHeading(label) {
  const heading = document.createElement("p");
  heading.className = "availFloorHeading";
  heading.textContent = label;
  return heading;
}

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

function clampAvailTimeOption(hhmm) {
  const mins = hhmmToMinutes(hhmm);
  const minBound = hhmmToMinutes(AVAIL_TIME_OPTIONS[0]);
  const maxBound = hhmmToMinutes(AVAIL_TIME_OPTIONS[AVAIL_TIME_OPTIONS.length - 1]);
  const clamped = Math.max(minBound, Math.min(maxBound, mins));
  const snapped = snapAvailMinutes(clamped, "floor");
  const nearest =
    AVAIL_TIME_OPTIONS.find(t => hhmmToMinutes(t) >= snapped) ||
    AVAIL_TIME_OPTIONS[AVAIL_TIME_OPTIONS.length - 1];
  return nearest;
}

function defaultAvailWindowFromNow() {
  // Hidden query window for live mode / day overview — not shown in the Now UI.
  return {
    date: todayDateInputValue(),
    start: AVAIL_TIME_OPTIONS[0],
    end: AVAIL_TIME_OPTIONS[AVAIL_TIME_OPTIONS.length - 1]
  };
}

function defaultAvailTimeslotWindow() {
  const start = clampAvailTimeOption(
    minutesToHhmm(new Date().getHours() * 60 + new Date().getMinutes())
  );
  const startMin = hhmmToMinutes(start);
  const preferredEnd = startMin + 60;
  let end =
    AVAIL_TIME_OPTIONS.find(t => hhmmToMinutes(t) >= preferredEnd) ||
    AVAIL_TIME_OPTIONS[AVAIL_TIME_OPTIONS.length - 1];
  if (hhmmToMinutes(end) <= startMin) {
    const next = AVAIL_TIME_OPTIONS.find(t => hhmmToMinutes(t) > startMin);
    end = next || AVAIL_TIME_OPTIONS[AVAIL_TIME_OPTIONS.length - 1];
  }
  return { date: todayDateInputValue(), start, end };
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

function applyAvailControlValues(values) {
  const dateInput = document.getElementById("availDate");
  const startSelect = document.getElementById("availStart");
  const endSelect = document.getElementById("availEnd");
  if (!dateInput || !startSelect || !endSelect) return;

  dateInput.value = values.date;
  fillTimeSelect(startSelect, values.start);
  fillTimeSelect(endSelect, values.end);
  if (startSelect.value !== values.start) startSelect.value = values.start;
  if (endSelect.value !== values.end) endSelect.value = values.end;
}

function updateAvailModeUI(opts = {}) {
  const liveNow = opts.liveNow ?? availLiveNowMode;
  const clock = opts.clock || "";
  const form = document.getElementById("availForm");
  const liveChip = document.getElementById("availLiveChip");
  const liveTime = document.getElementById("availLiveChipTime");
  const timeFields = document.getElementById("availTimeFields");
  const toggleBtn = document.getElementById("availModeToggleBtn");
  const title = document.getElementById("availNowTitle");
  const dateInput = document.getElementById("availDate");

  if (form) form.classList.toggle("is-live-now", liveNow);
  if (form) form.classList.toggle("is-timeslot", !liveNow);
  if (liveChip) liveChip.hidden = !liveNow;
  if (timeFields) timeFields.hidden = liveNow;
  if (liveTime) liveTime.textContent = clock ? clock : "";
  if (title) title.textContent = liveNow ? "Free now" : "Free rooms";
  if (toggleBtn) {
    toggleBtn.textContent = liveNow ? "Pick times" : "Now";
    toggleBtn.setAttribute(
      "aria-label",
      liveNow ? "Pick a date and timeslot" : "Show rooms free right now"
    );
    toggleBtn.classList.toggle("is-active-now", !liveNow);
  }
  if (dateInput) {
    // Live mode is always “today”; keep the date field for timeslot checks.
    dateInput.disabled = !!liveNow;
  }
}

function resetAvailControlsToNow(opts = {}) {
  ensureAvailControlsReady();
  availLiveNowMode = true;
  applyAvailControlValues(defaultAvailWindowFromNow());
  updateAvailModeUI({ liveNow: true });
  if (opts.reload !== false && getAvailToken()) {
    loadAvailability({ mode: "window" });
  }
}

function enterAvailTimeslotMode() {
  ensureAvailControlsReady();
  availLiveNowMode = false;
  applyAvailControlValues(defaultAvailTimeslotWindow());
  updateAvailModeUI({ liveNow: false });
  if (getAvailToken()) loadAvailability({ mode: "window" });
}

function scheduleAvailQueryReload() {
  if (availQueryTimerId) clearTimeout(availQueryTimerId);
  availQueryTimerId = setTimeout(() => {
    availQueryTimerId = null;
    if (currentMode === "availability" && getAvailToken()) {
      loadAvailability({ mode: "window" });
    }
  }, 280);
}

function bindAvailControlListeners() {
  const dateInput = document.getElementById("availDate");
  const startSelect = document.getElementById("availStart");
  const endSelect = document.getElementById("availEnd");
  if (!dateInput || !startSelect || !endSelect) return;

  const onTimeslotChange = () => {
    if (availLiveNowMode) return;
    scheduleAvailQueryReload();
  };

  dateInput.addEventListener("change", () => {
    if (availLiveNowMode) {
      // Date is locked in live mode; ignore.
      dateInput.value = todayDateInputValue();
      return;
    }
    scheduleAvailQueryReload();
  });
  startSelect.addEventListener("change", onTimeslotChange);
  endSelect.addEventListener("change", onTimeslotChange);
}

function ensureAvailControlsReady() {
  if (availControlsReady) return;
  const dateInput = document.getElementById("availDate");
  const startSelect = document.getElementById("availStart");
  const endSelect = document.getElementById("availEnd");
  if (!dateInput || !startSelect || !endSelect) return;

  applyAvailControlValues(defaultAvailWindowFromNow());
  bindAvailControlListeners();
  updateAvailModeUI({ liveNow: true });
  availControlsReady = true;
}

function getAvailQuery() {
  ensureAvailControlsReady();

  if (availLiveNowMode) {
    return defaultAvailWindowFromNow();
  }

  const date = document.getElementById("availDate")?.value || todayDateInputValue();
  let start = document.getElementById("availStart")?.value || defaultAvailTimeslotWindow().start;
  let end =
    document.getElementById("availEnd")?.value ||
    AVAIL_TIME_OPTIONS[AVAIL_TIME_OPTIONS.length - 1];

  if (hhmmToMinutes(end) <= hhmmToMinutes(start)) {
    const next = AVAIL_TIME_OPTIONS.find(t => hhmmToMinutes(t) > hhmmToMinutes(start));
    end = next || AVAIL_TIME_OPTIONS[AVAIL_TIME_OPTIONS.length - 1];
    if (hhmmToMinutes(end) <= hhmmToMinutes(start)) {
      start = AVAIL_TIME_OPTIONS[0];
      end = AVAIL_TIME_OPTIONS[Math.min(2, AVAIL_TIME_OPTIONS.length - 1)];
    }
    const startSelect = document.getElementById("availStart");
    const endSelect = document.getElementById("availEnd");
    if (startSelect) startSelect.value = start;
    if (endSelect) endSelect.value = end;
  }

  return { date, start, end };
}

function isAvailLiveNowView(data, q) {
  if (!availLiveNowMode) return false;
  if (!data) return false;
  const today = data.today || todayDateInputValue();
  if ((q?.date || data.date) !== today) return false;
  return true;
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
      ? "13/F · 10/F · 8/F · shared Helios & Achievers calendars"
      : "Password required · room availability";
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
      <p class="modalTitle" id="availLoginTitle">Room availability</p>
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

function checkAvailability() {
  return loadAvailability({ mode: "window" });
}

async function loadAvailability(opts = {}) {
  if (!staffMode) return;
  if (!getAvailToken()) {
    updateAvailAuthUI(false);
    if (!opts.silent) promptAvailPassword();
    return;
  }

  const mode = opts.mode || (opts.silent ? "silent" : "full");
  const updateList = true;
  const updateOverview = mode === "full" || mode === "silent" || mode === "window";

  const nowCards = document.getElementById("availNowCards");
  const tally = document.getElementById("availNowTally");
  const gridWrap = document.getElementById("availGridWrap");
  const modeBtn = document.getElementById("availModeToggleBtn");
  const refreshBtn = document.getElementById("availRefreshBtn");
  if (!gridWrap || !nowCards) return;

  if (opts.date && !availLiveNowMode) {
    const dateInput = document.getElementById("availDate");
    if (dateInput) dateInput.value = opts.date;
  }

  // Silent auto-refresh keeps live mode on today’s full-day query window.
  if (mode === "silent" && availLiveNowMode) {
    applyAvailControlValues(defaultAvailWindowFromNow());
  }

  const q = getAvailQuery();
  if (opts.date && !availLiveNowMode) q.date = opts.date;

  if (modeBtn) modeBtn.disabled = true;
  if (refreshBtn) refreshBtn.disabled = true;

  if (mode === "full") {
    nowCards.innerHTML = "";
    if (tally) tally.textContent = "";
    gridWrap.innerHTML = "";
    nowCards.appendChild(renderLoading("Loading room availability…"));
  } else if (mode === "window") {
    nowCards.classList.add("is-loading");
    if (tally) tally.textContent = "Updating…";
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
      nowCards.classList.remove("is-loading");
      if (tally) tally.textContent = "";
      gridWrap.innerHTML = "";
      if (!opts.silent) promptAvailPassword();
      return;
    }

    if (data?.error || !data?.rooms) {
      throw new Error(data?.error || "Invalid availability payload");
    }

    availData = data;
    // After create, Calendar can lag — keep the local booking painted.
    if (opts.ensureCreated) {
      const room = (data.rooms || []).find(r => r.id === opts.ensureCreated.roomId);
      const serverHas = roomHasCreatedEvent(room, opts.ensureCreated);
      if (!serverHas) {
        applyCreatedAvailabilityEvent(opts.ensureCreated);
        data = availData || data;
      }
      data._createdEventSynced = serverHas;
    }
    renderAvailability(data, { updateList, updateOverview, query: q });
    scheduleAvailRefresh();
    return data;
  } catch (err) {
    nowCards.classList.remove("is-loading");
    nowCards.innerHTML = "";
    if (updateOverview) gridWrap.innerHTML = "";
    if (tally) tally.textContent = "";
    nowCards.appendChild(
      renderEmpty(
        "Could not load availability",
        "Set AVAILABILITY_PASSWORD, share Helios + WC calendars with the script account, redeploy, then unlock again."
      )
    );
    return null;
  } finally {
    nowCards.classList.remove("is-loading");
    if (modeBtn) modeBtn.disabled = false;
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

function renderAvailability(data, opts = {}) {
  const updateList = opts.updateList !== false;
  const updateOverview = opts.updateOverview !== false;
  const q = opts.query || getAvailQuery();
  const liveNow = isAvailLiveNowView(data, q);

  const nowCards = document.getElementById("availNowCards");
  const nowMeta = document.getElementById("availNowMeta");
  const tally = document.getElementById("availNowTally");
  const overviewMeta = document.getElementById("availOverviewMeta");
  const gridWrap = document.getElementById("availGridWrap");
  if (!nowCards || !gridWrap) return;

  const rooms = visibleAvailRooms(data.rooms);
  const floorGroups = groupAvailRoomsByFloor(rooms);

  if (updateList) {
    nowCards.innerHTML = "";
    nowCards.className = "availNowByFloor";
    nowCards.classList.remove("is-loading");

    const freeCount = rooms.filter(r => {
      if (liveNow && r.now) return r.now.status !== "busy";
      return r.status !== "busy";
    }).length;
    const busyCount = rooms.length - freeCount;
    const conflictCount = rooms.filter(r =>
      roomHasConflicts(r, { useToday: liveNow })
    ).length;

    updateAvailModeUI({ liveNow, clock: data.now });

    if (nowMeta) {
      nowMeta.textContent = liveNow
        ? `Updated ${data.now} · tap a room for today’s calendar`
        : `${data.date} · ${data.start}–${data.end} · tap a room for the day calendar`;
    }

    if (tally) {
      tally.textContent =
        conflictCount > 0
          ? `${freeCount} free · ${busyCount} busy · ${conflictCount} conflict`
          : `${freeCount} free · ${busyCount} busy`;
      tally.classList.toggle("has-conflict", conflictCount > 0);
    }

    floorGroups.forEach(group => {
      const block = document.createElement("div");
      block.className = "availFloorGroup";
      block.appendChild(createAvailFloorHeading(group.label));
      const list = document.createElement("div");
      list.className = "availNowList";
      list.setAttribute("role", "list");
      group.rooms.forEach(room => {
        list.appendChild(createAvailNowCard(room, data, { liveNow }));
      });
      block.appendChild(list);
      nowCards.appendChild(block);
    });
  }

  if (updateOverview) {
    if (overviewMeta) {
      overviewMeta.textContent = `${data.date} · green = free · navy = occupied · red = conflict`;
    }
    gridWrap.innerHTML = "";
    renderAvailOverviewGrid({ ...data, rooms }, gridWrap);
  }
}

function createAvailNowCard(room, data, opts = {}) {
  const liveNow = !!opts.liveNow;
  const now = room.now;
  const windowBusy = room.status === "busy";
  const windowConflict = roomHasConflicts(room, { useToday: false });

  // Live “now” uses the server’s current-status summary; custom windows use the query range.
  const useLiveSummary = liveNow && now;
  const isBusy = useLiveSummary ? now.status === "busy" : windowBusy;
  const conflict = useLiveSummary
    ? !!(now && now.hasConflict) || roomHasConflicts(room, { useToday: true })
    : windowConflict;

  let detailText = "Free in this window";
  if (conflict) {
    detailText = useLiveSummary && now?.hasConflict
      ? "Double booked right now · tap to review"
      : "Overlapping bookings · tap to review";
  } else if (useLiveSummary) {
    if (isBusy && now?.eventTitle) {
      detailText = `${now.summary || "Busy"} · ${now.eventTitle}`;
    } else {
      detailText = now?.summary || "Free for the rest of today";
    }
  } else if (isBusy && Array.isArray(room.events) && room.events.length) {
    const first = room.events[0];
    const time = `${first.start || ""}–${first.end || ""}`.replace(/^–|–$/g, "");
    detailText =
      room.events.length === 1
        ? `${time || "Busy"} · ${first.title || "Booked"}`
        : `${room.events.length} bookings in this window`;
  }

  const row = document.createElement("button");
  row.type = "button";
  row.className = `availNowRow is-${conflict ? "conflict" : isBusy ? "busy" : "available"}`;
  row.setAttribute("role", "listitem");
  row.setAttribute(
    "aria-label",
    `${room.label || room.id}: ${
      conflict ? "Conflict — overlapping bookings" : detailText || (isBusy ? "Busy" : "Free")
    }`
  );

  const left = document.createElement("div");
  left.className = "availNowLeft";

  const name = document.createElement("span");
  name.className = "availNowName";
  name.textContent = room.label || room.id;

  const until = document.createElement("span");
  until.className = "availNowUntil";
  until.textContent = detailText;

  left.appendChild(name);
  left.appendChild(until);

  const badge = document.createElement("span");
  badge.className = "availNowBadge";
  badge.textContent = conflict ? "Conflict" : isBusy ? "Busy" : "Free";

  const chevron = document.createElement("span");
  chevron.className = "availNowChevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "›";

  row.appendChild(left);
  row.appendChild(badge);
  row.appendChild(chevron);

  row.addEventListener("click", () =>
    openRoomDayCalendar(room.id, data, { date: data.date, useToday: liveNow })
  );
  return row;
}

function formatAvailHourLabel(slot) {
  const hour = parseInt(slot, 10);
  if (Number.isNaN(hour)) return slot;
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

function eventsOverlapRange(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function roomHasConflicts(room, opts = {}) {
  if (!room) return false;
  if (opts.useToday) {
    const todayEvents = room.todayEvents || room.dayEvents;
    if (Array.isArray(todayEvents)) {
      return countOverlappingEventPairs(todayEvents) > 0;
    }
    return !!room.todayHasConflict;
  }
  if (Array.isArray(room.dayEvents)) {
    return countOverlappingEventPairs(room.dayEvents) > 0;
  }
  return !!room.hasConflict;
}

function countOverlappingEventPairs(events) {
  const list = (events || [])
    .map(ev => ({
      start: hhmmToMinutes(ev.start),
      end: hhmmToMinutes(ev.end)
    }))
    .filter(ev => ev.end > ev.start);

  let count = 0;
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      if (eventsOverlapRange(list[i].start, list[i].end, list[j].start, list[j].end)) {
        count += 1;
      }
    }
  }
  return count;
}

function normalizeAvailEventList(events) {
  return (events || [])
    .map(ev => ({
      title: ev.title || "Busy",
      start: ev.start,
      end: ev.end,
      source: ev.source,
      startMin: hhmmToMinutes(ev.start),
      endMin: hhmmToMinutes(ev.end)
    }))
    .filter(ev => Number.isFinite(ev.startMin) && Number.isFinite(ev.endMin) && ev.endMin > ev.startMin);
}

function buildSlotBusyMap(events, slots) {
  const map = slots.map(() => false);
  const list = normalizeAvailEventList(events);

  slots.forEach((slot, idx) => {
    const slotStart = hhmmToMinutes(slot);
    const slotEnd = slotStart + 30;
    map[idx] = list.some(ev => eventsOverlapRange(ev.startMin, ev.endMin, slotStart, slotEnd));
  });
  return map;
}

function buildSlotMetaMap(events, slots) {
  const map = slots.map(() => null);
  const list = normalizeAvailEventList(events);

  slots.forEach((slot, idx) => {
    const slotStart = hhmmToMinutes(slot);
    const slotEnd = slotStart + 30;
    const hit = list.find(ev => eventsOverlapRange(ev.startMin, ev.endMin, slotStart, slotEnd));
    if (hit) {
      map[idx] = {
        title: hit.title,
        start: hit.start,
        end: hit.end,
        source: hit.source
      };
    }
  });
  return map;
}

function buildSlotConflictMap(events, slots) {
  const map = slots.map(() => false);
  const list = normalizeAvailEventList(events);

  slots.forEach((slot, idx) => {
    const slotStart = hhmmToMinutes(slot);
    const slotEnd = slotStart + 30;
    // Events that touch this 30-min bucket
    const hits = list.filter(ev => eventsOverlapRange(ev.startMin, ev.endMin, slotStart, slotEnd));
    // Red only if two of those bookings actually overlap each other
    // (back-to-back lessons sharing a bucket must stay navy, not red).
    for (let i = 0; i < hits.length; i += 1) {
      for (let j = i + 1; j < hits.length; j += 1) {
        if (eventsOverlapRange(hits[i].startMin, hits[i].endMin, hits[j].startMin, hits[j].endMin)) {
          map[idx] = true;
          return;
        }
      }
    }
  });
  return map;
}

function eventKeyForDedupe(ev) {
  // Time window is enough to collapse optimistic + Calendar copies of the same booking.
  return `${ev.start || ""}|${ev.end || ""}`;
}

function computeClientNowStatus(dayEvents, nowHhmm) {
  const nowMin = hhmmToMinutes(nowHhmm);
  if (!Number.isFinite(nowMin)) {
    return {
      status: "available",
      until: null,
      summary: "Free for the rest of today",
      eventTitle: "",
      hasConflict: false
    };
  }

  const list = normalizeAvailEventList(dayEvents).sort((a, b) => a.startMin - b.startMin);
  const active = list.filter(ev => ev.startMin <= nowMin && nowMin < ev.endMin);
  if (active.length) {
    const untilMin = Math.max(...active.map(ev => ev.endMin));
    const until = `${String(Math.floor(untilMin / 60)).padStart(2, "0")}:${String(untilMin % 60).padStart(2, "0")}`;
    return {
      status: "busy",
      until,
      summary: `Busy until ${until}`,
      eventTitle: active[0].title || "Busy",
      hasConflict: active.length > 1 || countOverlappingEventPairs(list) > 0
    };
  }

  const next = list.find(ev => ev.startMin > nowMin);
  if (next) {
    return {
      status: "available",
      until: next.start,
      summary: `Free until ${next.start}`,
      eventTitle: "",
      hasConflict: false
    };
  }

  return {
    status: "available",
    until: null,
    summary: "Free for the rest of today",
    eventTitle: "",
    hasConflict: false
  };
}

function mergeAvailEventIntoRoom(room, event, { isToday, nowHhmm } = {}) {
  if (!room || !event) return room;

  const next = {
    ...room,
    dayEvents: [...(room.dayEvents || [])],
    todayEvents: [...(room.todayEvents || [])],
    events: [...(room.events || [])]
  };

  const key = eventKeyForDedupe(event);
  const upsert = list => {
    const filtered = list.filter(ev => eventKeyForDedupe(ev) !== key);
    filtered.push({
      title: event.title,
      start: event.start,
      end: event.end,
      source: event.source
    });
    filtered.sort((a, b) => hhmmToMinutes(a.start) - hhmmToMinutes(b.start));
    return filtered;
  };

  next.dayEvents = upsert(next.dayEvents);
  if (isToday) next.todayEvents = upsert(next.todayEvents);
  next.events = upsert(next.events);
  next.status = next.events.length ? "busy" : "available";
  next.hasConflict = countOverlappingEventPairs(next.dayEvents) > 0;
  if (isToday) {
    next.todayHasConflict = countOverlappingEventPairs(next.todayEvents) > 0;
    if (nowHhmm) {
      next.now = computeClientNowStatus(next.todayEvents.length ? next.todayEvents : next.dayEvents, nowHhmm);
    }
  }
  return next;
}

function roomHasCreatedEvent(room, created) {
  if (!room || !created) return false;
  const key = eventKeyForDedupe({
    title: created.title,
    start: created.start,
    end: created.end
  });
  return (room.dayEvents || []).some(ev => eventKeyForDedupe(ev) === key);
}

function applyCreatedAvailabilityEvent(created) {
  if (!availData || !created?.roomId) return null;

  // Only patch the day currently shown — otherwise wait for a dated reload.
  if (created.date && availData.date && created.date !== availData.date) {
    return availData;
  }

  const roomId = created.roomId;
  const event = {
    title: created.title,
    start: created.start,
    end: created.end,
    source: Array.isArray(created.created) && created.created[0]?.calendar
      ? created.created[0].calendar
      : undefined
  };
  const isToday = availData.date === availData.today || created.date === availData.today;

  const rooms = (availData.rooms || []).map(room =>
    room.id === roomId
      ? mergeAvailEventIntoRoom(room, event, { isToday, nowHhmm: availData.now })
      : room
  );

  // Keep grid arrays in sync so Free-now / overview stay consistent
  // even before Calendar API returns the new event.
  const slots = availData.slots || [];
  const room = rooms.find(r => r.id === roomId);
  const grid = { ...(availData.grid || {}) };
  const gridMeta = { ...(availData.gridMeta || {}) };
  const gridConflict = { ...(availData.gridConflict || {}) };
  if (room && slots.length) {
    grid[roomId] = buildSlotBusyMap(room.dayEvents, slots);
    gridMeta[roomId] = buildSlotMetaMap(room.dayEvents, slots);
    gridConflict[roomId] = buildSlotConflictMap(room.dayEvents, slots);
  }

  availData = {
    ...availData,
    rooms,
    grid,
    gridMeta,
    gridConflict
  };
  return availData;
}

async function refreshAvailabilityAfterCreate(created) {
  // Calendar can lag briefly after createEvent — retry a few times and
  // keep the optimistic booking painted until the API includes it.
  const dateStr = created?.date;
  const delays = [400, 1200, 2500];
  let latest = null;
  for (const delay of delays) {
    await new Promise(resolve => setTimeout(resolve, delay));
    latest = await loadAvailability({
      silent: true,
      date: dateStr,
      ensureCreated: created
    });
    if (latest?._createdEventSynced) return latest;
  }
  return availData;
}

function renderAvailOverviewGrid(data, gridWrap) {
  const slots = data.slots || [];
  const grid = data.grid || {};
  const gridMeta = data.gridMeta || {};
  const gridConflict = data.gridConflict || {};
  const floorGroups = groupAvailRoomsByFloor(data.rooms);
  if (!slots.length || !floorGroups.length) return;

  const legend = document.createElement("div");
  legend.className = "availGridLegend";
  legend.innerHTML = `
    <span class="availGridLegendItem"><i class="availGridSwatch is-free" aria-hidden="true"></i>Free</span>
    <span class="availGridLegendItem"><i class="availGridSwatch is-busy" aria-hidden="true"></i>Occupied</span>
    <span class="availGridLegendItem"><i class="availGridSwatch is-conflict" aria-hidden="true"></i>Conflict</span>
    <span class="availGridLegendNote">Each block = 30 min</span>
  `;
  gridWrap.appendChild(legend);

  floorGroups.forEach(group => {
    const block = document.createElement("div");
    block.className = "availFloorGroup";
    block.appendChild(createAvailFloorHeading(group.label));

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
    slots.forEach((slot, idx) => {
      if (!slot.endsWith(":00")) return;

      const cell = document.createElement("div");
      cell.className = "availGridTime is-hour";
      cell.title = slot;
      cell.textContent = formatAvailHourLabel(slot);

      const spansHalf = !!(slots[idx + 1] && slots[idx + 1].endsWith(":30"));
      cell.style.gridColumn = `span ${spansHalf ? 2 : 1}`;
      head.appendChild(cell);
    });
    table.appendChild(head);

    group.rooms.forEach(room => {
      const id = room.id;
      const row = document.createElement("div");
      row.className = "availGridRow";

      const label = document.createElement("button");
      label.type = "button";
      label.className = "availGridRoom";
      label.textContent = room.label || id;
      label.addEventListener("click", () => openRoomDayCalendar(id, data));
      row.appendChild(label);

      // Paint from dayEvents so optimistic creates show immediately,
      // and adjacent lessons stay navy (not red) even if API flags lag.
      const busyFlags = Array.isArray(room.dayEvents)
        ? buildSlotBusyMap(room.dayEvents, slots)
        : (grid[id] || []);
      const metaRow = Array.isArray(room.dayEvents)
        ? buildSlotMetaMap(room.dayEvents, slots)
        : (gridMeta[id] || []);
      const conflictFlags = Array.isArray(room.dayEvents)
        ? buildSlotConflictMap(room.dayEvents, slots)
        : (gridConflict[id] || []);
      slots.forEach((_, idx) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "availGridCell";
        const busy = !!busyFlags[idx];
        const conflict = !!conflictFlags[idx];
        cell.classList.toggle("is-conflict", conflict);
        cell.classList.toggle("is-busy", busy && !conflict);
        cell.classList.toggle("is-free", !busy && !conflict);
        const meta = metaRow[idx];
        const slotLabel = slots[idx];
        if (conflict) {
          cell.title = `${id} conflict at ${slotLabel} — overlapping bookings`;
          cell.setAttribute("aria-label", cell.title);
        } else if (busy && meta) {
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
    block.appendChild(scroller);
    gridWrap.appendChild(block);
  });
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

  const laidOut = groups.flatMap(({ events: groupEvents }) => {
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

  return laidOut.map((event, idx, all) => {
    const conflict = all.some(
      (other, otherIdx) =>
        otherIdx !== idx &&
        eventsOverlapRange(event.startMin, event.endMin, other.startMin, other.endMin)
    );
    return { ...event, conflict };
  });
}

function minutesToHhmm(totalMin) {
  const t = Math.max(0, Math.round(totalMin));
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function snapAvailMinutes(min, mode = "nearest") {
  const step = 30;
  if (mode === "floor") return Math.floor(min / step) * step;
  if (mode === "ceil") return Math.ceil(min / step) * step;
  return Math.round(min / step) * step;
}

function defaultCreateCalendarsForRoom(roomId) {
  const floor = availRoomFloorId(roomId);
  if (floor === "13") return { helios: true, wc10: false };
  return { helios: false, wc10: true };
}

function openRoomDayCalendar(roomId, data, opts = {}) {
  const room = (data.rooms || []).find(r => r.id === roomId);
  if (!room) return;

  // Prefer explicit date; Free now passes useToday to show today's schedule.
  const viewDate = String(
    opts.date || (opts.useToday ? data.today || data.date : data.date) || ""
  ).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(viewDate)) return;

  const viewingToday = viewDate === data.today;
  const viewEvents =
    viewingToday && Array.isArray(room.todayEvents)
      ? room.todayEvents
      : viewDate === data.date
        ? room.dayEvents || []
        : room.dayEvents || [];
  const showNowLine = viewingToday;

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
  subEl.textContent = `${viewDate} · ${data.gridStart || "09:00"}–${data.gridEnd || "21:00"} · drag empty time to book`;
  header.appendChild(titleEl);
  header.appendChild(subEl);

  const conflictCount = countOverlappingEventPairs(viewEvents);
  if (conflictCount > 0) {
    const flag = document.createElement("p");
    flag.className = "availDayConflictFlag";
    flag.textContent = "Conflict: overlapping bookings in this room (shown in red)";
    header.appendChild(flag);
  }

  const body = document.createElement("div");
  body.className = "modalBody availDayBody";
  body.appendChild(
    buildRoomDayTimeline(
      { ...room, dayEvents: viewEvents },
      { ...data, date: viewDate, isToday: showNowLine },
      { viewDate }
    )
  );
  const scrollPad = document.createElement("div");
  scrollPad.className = "availDayScrollPad";
  scrollPad.setAttribute("aria-hidden", "true");
  body.appendChild(scrollPad);

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

function buildRoomDayTimeline(room, data, viewOpts = {}) {
  const wrap = document.createElement("div");
  wrap.className = "availDayTimeline";

  const totalMins = AVAIL_GRID_END_MIN - AVAIL_GRID_START_MIN;
  const height = Math.round(totalMins * AVAIL_PX_PER_MIN);
  wrap.style.height = `${height}px`;
  wrap.style.setProperty("--avail-hour-px", `${60 * AVAIL_PX_PER_MIN}px`);
  wrap.style.setProperty("--avail-px-per-min", String(AVAIL_PX_PER_MIN));

  const hours = document.createElement("div");
  hours.className = "availDayHours";
  for (let t = AVAIL_GRID_START_MIN; t <= AVAIL_GRID_END_MIN; t += 60) {
    const label = document.createElement("div");
    label.className = "availDayHour" + (t === AVAIL_GRID_END_MIN ? " is-end" : "");
    label.style.top = `${(t - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
    const h = Math.floor(t / 60);
    label.textContent = `${h}:00`;
    hours.appendChild(label);

    if (t < AVAIL_GRID_END_MIN) {
      const line = document.createElement("div");
      line.className = "availDayHourLine";
      line.style.top = `${(t - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
      wrap.appendChild(line);
    }
  }
  // End-of-day line
  const endLine = document.createElement("div");
  endLine.className = "availDayHourLine";
  endLine.style.top = `${(AVAIL_GRID_END_MIN - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
  wrap.appendChild(endLine);
  wrap.appendChild(hours);

  const track = document.createElement("div");
  track.className = "availDayTrack";

  const events = layoutRoomDayEvents(
    Array.isArray(room.dayEvents) ? room.dayEvents : []
  );
  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "availDayEmpty";
    empty.textContent = "No bookings · drag to add";
    track.appendChild(empty);
  } else {
    events.forEach(ev => {
      const block = document.createElement("button");
      block.type = "button";
      block.className = "availDayEvent";
      const durationMins = ev.endMin - ev.startMin;
      const durationPx = durationMins * AVAIL_PX_PER_MIN;
      const minHeight = durationMins <= 30 ? 40 : 28;
      block.style.top = `${(ev.startMin - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
      block.style.height = `${Math.max(minHeight, durationPx)}px`;
      block.style.setProperty("--event-col", String(ev.column));
      block.style.setProperty("--event-cols", String(ev.columnCount));
      block.classList.toggle("is-compact", durationMins <= 30 || durationPx < 52);
      block.classList.toggle("is-conflict", !!ev.conflict);

      const time = document.createElement("span");
      time.className = "availDayEventTime";
      time.textContent = `${ev.start}–${ev.end}`;

      const title = document.createElement("span");
      title.className = "availDayEventTitle";
      title.textContent = ev.title || "Busy";

      block.appendChild(time);
      block.appendChild(title);
      if (ev.source === "wc10" || ev.source === "helios") {
        block.classList.add(ev.source === "wc10" ? "is-from-wc10" : "is-from-helios");
        const src = document.createElement("span");
        src.className = "availDaySourceTag";
        src.textContent = ev.source === "wc10" ? "Achievers" : "Helios";
        block.appendChild(src);
      }
      if (ev.conflict) {
        const tag = document.createElement("span");
        tag.className = "availDayConflictTag";
        tag.textContent = "Conflict";
        block.appendChild(tag);
      }
      const sourceNote =
        ev.source === "wc10"
          ? " · from Achievers calendar"
          : ev.source === "helios"
            ? " · from Helios calendar"
            : "";
      block.title = ev.conflict
        ? `Conflict · ${ev.start}–${ev.end} · ${ev.title || "Busy"}${sourceNote}`
        : `${ev.start}–${ev.end} · ${ev.title || "Busy"}${sourceNote}`;
      block.addEventListener("pointerdown", e => e.stopPropagation());
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

  enableAvailDayDragCreate(wrap, room, data, viewOpts);
  return wrap;
}

function enableAvailDayDragCreate(wrap, room, data, viewOpts = {}) {
  if (!wrap) return;

  const viewDate = String(viewOpts.viewDate || data.date || "").trim();
  let pointerId = null;
  let originMin = 0;
  let ghost = null;

  function clientYToMinutes(clientY) {
    const rect = wrap.getBoundingClientRect();
    const y = clientY - rect.top;
    const raw = AVAIL_GRID_START_MIN + y / AVAIL_PX_PER_MIN;
    return Math.min(AVAIL_GRID_END_MIN, Math.max(AVAIL_GRID_START_MIN, raw));
  }

  function selectionRange(a, b) {
    let start = snapAvailMinutes(Math.min(a, b), "floor");
    let end = snapAvailMinutes(Math.max(a, b), "ceil");
    if (end <= start) end = start + 30;
    start = Math.max(AVAIL_GRID_START_MIN, start);
    end = Math.min(AVAIL_GRID_END_MIN, end);
    if (end <= start) {
      if (start + 30 <= AVAIL_GRID_END_MIN) end = start + 30;
      else {
        end = AVAIL_GRID_END_MIN;
        start = end - 30;
      }
    }
    return { start, end };
  }

  function paintGhost(start, end) {
    if (!ghost) {
      ghost = document.createElement("div");
      ghost.className = "availDaySelectGhost";
      ghost.setAttribute("aria-hidden", "true");
      wrap.appendChild(ghost);
    }
    ghost.style.top = `${(start - AVAIL_GRID_START_MIN) * AVAIL_PX_PER_MIN}px`;
    ghost.style.height = `${Math.max(18, (end - start) * AVAIL_PX_PER_MIN)}px`;
    ghost.textContent = `${minutesToHhmm(start)}–${minutesToHhmm(end)}`;
  }

  function clearGhost() {
    if (ghost) {
      ghost.remove();
      ghost = null;
    }
  }

  function detachWindowListeners() {
    window.removeEventListener("pointermove", onWindowMove);
    window.removeEventListener("pointerup", onWindowUp);
    window.removeEventListener("pointercancel", onWindowCancel);
  }

  function onWindowMove(e) {
    if (pointerId == null || e.pointerId !== pointerId) return;
    e.preventDefault();
    const range = selectionRange(originMin, clientYToMinutes(e.clientY));
    paintGhost(range.start, range.end);
  }

  function onWindowUp(e) {
    if (pointerId == null || e.pointerId !== pointerId) return;
    finish(e.clientY);
  }

  function onWindowCancel(e) {
    if (pointerId == null || (e && e.pointerId !== pointerId)) return;
    clearGhost();
    wrap.classList.remove("is-dragging");
    pointerId = null;
    detachWindowListeners();
  }

  function finish(clientY) {
    if (pointerId == null) return;
    const range = selectionRange(originMin, clientYToMinutes(clientY));
    clearGhost();
    wrap.classList.remove("is-dragging");
    pointerId = null;
    detachWindowListeners();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(viewDate)) return;
    openAvailCreateEventModal({
      room,
      date: viewDate,
      start: minutesToHhmm(range.start),
      end: minutesToHhmm(range.end)
    });
  }

  wrap.addEventListener("pointerdown", e => {
    if (e.button != null && e.button !== 0) return;
    if (e.target.closest(".availDayEvent")) return;
    e.preventDefault();
    pointerId = e.pointerId;
    originMin = clientYToMinutes(e.clientY);
    const range = selectionRange(originMin, originMin);
    paintGhost(range.start, range.end);
    wrap.classList.add("is-dragging");
    try {
      wrap.setPointerCapture(pointerId);
    } catch (_) {
      /* ignore */
    }
    window.addEventListener("pointermove", onWindowMove, { passive: false });
    window.addEventListener("pointerup", onWindowUp);
    window.addEventListener("pointercancel", onWindowCancel);
  });
}

function openAvailCreateEventModal(opts) {
  const room = opts.room;
  if (!room) return;

  document.querySelectorAll(".modalOverlay[data-avail-create]").forEach(el => el.remove());

  const defaults = defaultCreateCalendarsForRoom(room.id);
  const overlay = document.createElement("div");
  overlay.className = "modalOverlay";
  overlay.setAttribute("data-avail-create", "1");
  overlay.style.zIndex = "70";

  const modal = document.createElement("div");
  modal.className = "modal availCreateModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "availCreateTitle");

  const roomPrefix = room.id === "CEO" ? "CEO Room" : room.id;
  const roomLocation =
    room.id === "CEO" || /^1309/i.test(room.id)
      ? `${room.label || room.id}, 13/F`
      : /^1012/i.test(room.id)
        ? `${room.label || room.id}, 10/F`
        : /^804/i.test(room.id)
          ? `${room.label || room.id}, 8/F`
          : room.label || room.id;

  modal.innerHTML = `
    <div class="modalHeader availCreateHeader">
      <p class="modalTitle" id="availCreateTitle">New booking</p>
      <div class="availCreateMeta">
        <span class="availCreateMetaRoom">${room.label || room.id}</span>
        <span class="availCreateMetaSep" aria-hidden="true">·</span>
        <span class="availCreateMetaDate">${opts.date}</span>
      </div>
    </div>
    <form class="modalBody availCreateForm" id="availCreateForm" autocomplete="off">
      <div class="availCreateTimeCard" role="group" aria-label="Time range">
        <p class="availCreateCalsLabel">Time</p>
        <div class="availCreateTimes">
          <label class="availCreateTimePick" for="availCreateStart">
            <span class="availCreateTimePickLabel">From</span>
            <span class="availCreateTimePickShell">
              <select id="availCreateStart" name="avail-create-start" required></select>
            </span>
          </label>
          <span class="availCreateTimeArrow" aria-hidden="true">
            <span class="availCreateTimeArrowLine"></span>
          </span>
          <label class="availCreateTimePick" for="availCreateEnd">
            <span class="availCreateTimePickLabel">To</span>
            <span class="availCreateTimePickShell">
              <select id="availCreateEnd" name="avail-create-end" required></select>
            </span>
          </label>
        </div>
        <p class="availCreateDuration" id="availCreateDuration"></p>
      </div>

      <div class="field availCreateTitleField">
        <label for="availCreateTitleInput">Event title</label>
        <input id="availCreateTitleInput" type="text" name="avail-create-title" maxlength="180" required placeholder="e.g. Parent meeting" />
        <p class="availCreateHint">Title <strong>${roomPrefix}: …</strong> · Location <strong>${roomLocation}</strong></p>
      </div>

      <div class="availCreateCals" role="group" aria-label="Add to calendar">
        <p class="availCreateCalsLabel">Calendars</p>
        <div class="availCreateCalGrid">
          <label class="availCreateCalChip">
            <input type="checkbox" id="availCreateHelios" name="cal-helios" ${
              defaults.helios ? "checked" : ""
            } />
            <span class="availCreateCalChipFace">
              <span class="availCreateCalChipName">Helios Calendar</span>
            </span>
          </label>
          <label class="availCreateCalChip">
            <input type="checkbox" id="availCreateWc10" name="cal-wc10" ${
              defaults.wc10 ? "checked" : ""
            } />
            <span class="availCreateCalChipFace">
              <span class="availCreateCalChipName">Achievers Calendar</span>
            </span>
          </label>
        </div>
      </div>

      <p class="availCreateError" id="availCreateError" hidden></p>

      <div class="modalActions availCreateActions">
        <button type="button" class="btnSecondary" id="availCreateCancel">Cancel</button>
        <button type="submit" id="availCreateSubmit">Create event</button>
      </div>
    </form>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const startSelect = modal.querySelector("#availCreateStart");
  const endSelect = modal.querySelector("#availCreateEnd");
  const durationEl = modal.querySelector("#availCreateDuration");
  const titleInput = modal.querySelector("#availCreateTitleInput");
  const heliosCb = modal.querySelector("#availCreateHelios");
  const wc10Cb = modal.querySelector("#availCreateWc10");
  const errEl = modal.querySelector("#availCreateError");
  const form = modal.querySelector("#availCreateForm");
  const cancelBtn = modal.querySelector("#availCreateCancel");
  const submitBtn = modal.querySelector("#availCreateSubmit");

  const startOpts = AVAIL_TIME_OPTIONS.filter(t => t !== "21:00");
  const endOpts = AVAIL_TIME_OPTIONS.filter(t => t !== "09:00");
  startSelect.innerHTML = "";
  startOpts.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    if (t === (opts.start || "09:00")) opt.selected = true;
    startSelect.appendChild(opt);
  });
  endSelect.innerHTML = "";
  endOpts.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    if (t === (opts.end || "09:30")) opt.selected = true;
    endSelect.appendChild(opt);
  });

  function updateCreateDuration() {
    if (!durationEl) return;
    const mins = hhmmToMinutes(endSelect.value) - hhmmToMinutes(startSelect.value);
    if (mins <= 0) {
      durationEl.textContent = "End time must be after start";
      durationEl.classList.add("is-invalid");
      return;
    }
    durationEl.classList.remove("is-invalid");
    if (mins < 60) {
      durationEl.textContent = `${mins} minutes`;
    } else if (mins % 60 === 0) {
      durationEl.textContent = mins === 60 ? "1 hour" : `${mins / 60} hours`;
    } else {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      durationEl.textContent = `${h}h ${m}m`;
    }
  }

  startSelect.addEventListener("change", () => {
    if (hhmmToMinutes(endSelect.value) <= hhmmToMinutes(startSelect.value)) {
      const next = hhmmToMinutes(startSelect.value) + 30;
      const nextStr = minutesToHhmm(Math.min(next, AVAIL_GRID_END_MIN));
      if ([...endSelect.options].some(o => o.value === nextStr)) {
        endSelect.value = nextStr;
      }
    }
    updateCreateDuration();
  });
  endSelect.addEventListener("change", updateCreateDuration);
  updateCreateDuration();

  const close = () => overlay.remove();
  cancelBtn?.addEventListener("click", close);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) close();
  });

  form?.addEventListener("submit", async e => {
    e.preventDefault();
    if (!getAvailToken()) {
      close();
      promptAvailPassword();
      return;
    }

    const start = startSelect.value;
    const end = endSelect.value;
    const title = (titleInput?.value || "").trim();
    const calendars = [];
    if (heliosCb?.checked) calendars.push("helios");
    if (wc10Cb?.checked) calendars.push("wc10");

    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = "";
    }

    if (!title) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = "Enter an event title";
      }
      titleInput?.focus();
      return;
    }
    if (hhmmToMinutes(end) <= hhmmToMinutes(start)) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = "End time must be after start time";
      }
      return;
    }
    if (!calendars.length) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = "Select at least one calendar";
      }
      return;
    }
    const eventDate = String(opts.date || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = "Missing booking date — close and open the room again";
      }
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "createAvailabilityEvent",
          key: STAFF_KEY,
          token: getAvailToken(),
          roomId: room.id,
          date: eventDate,
          start,
          end,
          title,
          calendars
        })
      });
      const data = await res.json();
      if (data?.authRequired) {
        clearAvailToken();
        close();
        updateAvailAuthUI(false);
        promptAvailPassword();
        return;
      }
      if (!data?.ok) {
        throw new Error(data?.error || "Could not create event");
      }
      close();
      // Show the booking immediately, then reconcile with Calendar in the background.
      applyCreatedAvailabilityEvent(data);
      if (availData) {
        renderAvailability(availData);
        openRoomDayCalendar(room.id, availData, { date: eventDate });
      }
      const fresh = await refreshAvailabilityAfterCreate(data);
      const payload = fresh || availData;
      if (payload) {
        const open = document.querySelector(".modalOverlay[data-room-cal]");
        if (open) {
          openRoomDayCalendar(room.id, payload, { date: eventDate });
        } else {
          renderAvailability(payload);
        }
      }
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = err.message || "Could not create event";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  setTimeout(() => titleInput?.focus(), 30);
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

loadStudentLang();
initLangSwitch();
initModeSwitch();
initDayNav();
applyAccessMode();
ensureAvailControlsReady();
updateAvailAuthUI(!!getAvailToken());
