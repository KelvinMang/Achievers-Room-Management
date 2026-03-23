const API_URL = "https://script.google.com/macros/s/AKfycbyqS294RZt9lU5wSD4yeaEryrVgwylSvH6GBbJySzajYuBLjVN2jUq6Psj2AHffDx37/exec";

async function search() {
  const nameInput = document.getElementById("name");
  const rawQuery = (nameInput.value || "").trim();
  const div = document.getElementById("results");
  const btn = document.getElementById("searchBtn");

  div.innerHTML = "";

  if (!rawQuery) {
    div.appendChild(renderEmpty("Enter a name", "Type a student or teacher name and press Search."));
    return;
  }

  // Step 1: Ask user whether they are student or tutor.
  showChoicesModal(["Student", "Tutor"],
    async roleChoice => {
      const role = roleChoice === "Tutor" ? "tutor" : "student";
      const queryName = extractNameByRole(rawQuery, role) || rawQuery;

      // Update the field so it's clear what we're searching for.
      nameInput.value = queryName;

      // Close role modal(s) before running the query.
      document.querySelectorAll(".modalOverlay").forEach(el => el.remove());
      await runQuery(queryName, { nameInput, div, btn, role });
    },
    () => {
      document.querySelectorAll(".modalOverlay").forEach(el => el.remove());
      div.innerHTML = "";
      div.appendChild(renderEmpty("Cancelled", "Select Student or Tutor to continue."));
    },
    { titleText: "Which role are you?", subText: "We will search your side of the input around 'x'." , modalId: "roleChoiceModal"}
  );
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderLoading() {
  const wrap = document.createElement("div");
  wrap.className = "loading";
  wrap.innerHTML = `
    <span class="spinner" aria-hidden="true"></span>
    <span>Loading...</span>
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
  title.textContent = e.title || "Lesson";

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
    : (e.roomFormatted && e.roomFormatted !== "TBC" ? e.roomFormatted : (e.room || "TBC"));

  kv.appendChild(kvItem("Location", location));
  kv.appendChild(kvItem("Room", room));

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

  btn.disabled = true;
  nameInput.disabled = true;
  div.innerHTML = "";
  div.appendChild(renderLoading());

  try {
    const res = await fetch(`${API_URL}?name=${encodeURIComponent(query)}&role=${encodeURIComponent(role || "")}`);
    const data = await res.json();

    // Backward compatibility: if backend still returns just an array.
    if (Array.isArray(data)) {
      div.innerHTML = "";
      if (!data.length) {
        div.appendChild(renderEmpty("No lessons today", "Please try another name."));
        return;
      }
      data.forEach(e => div.appendChild(createEventCard(e)));
      return;
    }

    // New format: { choices: [...], results: [...] }
    const choices = Array.isArray(data?.choices) ? data.choices : null;
    const results = Array.isArray(data?.results) ? data.results : null;

    const safeChoices = sanitizeChoices(choices);

    if (safeChoices && safeChoices.length > 1) {
      div.innerHTML = "";
      choicesModalEl = showChoicesModal(safeChoices, async selectedName => {
        if (choicesModalEl) choicesModalEl.remove();
        await runQuery(selectedName, { nameInput, div, btn, role });
      }, () => {
        if (choicesModalEl) choicesModalEl.remove();
        div.innerHTML = "";
        div.appendChild(renderEmpty("Cancelled", "Select a name to continue."));
      });
      return;
    }

    if (safeChoices && safeChoices.length === 1 && (!results || results.length === 0) && safeChoices[0] !== query) {
      // Backend might return only a single resolved choice for an ambiguous keyword.
      await runQuery(safeChoices[0], { nameInput, div, btn, role });
      return;
    }

    if (!results || results.length === 0) {
      div.innerHTML = "";
      div.appendChild(renderEmpty("No lessons today", "Please try another name."));
      return;
    }

    div.innerHTML = "";
    results.forEach(e => div.appendChild(createEventCard(e)));

  } catch (err) {
    console.error(err);
    div.innerHTML = "";
    div.appendChild(renderEmpty("Error loading data", "Please try again in a moment."));
  } finally {
    // If a modal is open (role choice or name choice), keep form disabled.
    const anyModalOpen = document.querySelector(".modalOverlay");
    if (!anyModalOpen) {
      btn.disabled = false;
      nameInput.disabled = false;
    }
  }
}

function sanitizeChoices(choices) {
  if (!Array.isArray(choices)) return null;

  // Remove non-name / generic tokens that your backend may accidentally capture.
  // Examples observed: "Student Vega", "Students Vega", "x Mang"
  const out = [];
  const seen = new Set();

  choices.forEach(c => {
    const val = String(c || "").trim();
    if (!val) return;
    if (/^x\b/i.test(val)) return;
    if (/^students?\b/i.test(val)) return;
    if (/^(tutor|teacher)s?\b/i.test(val)) return;

    const norm = val.toLowerCase();
    if (seen.has(norm)) return;
    seen.add(norm);
    out.push(val);
  });

  return out;
}

function extractNameByRole(rawQuery, role) {
  // Student is the part BEFORE 'x', Tutor is the part AFTER 'x'.
  // Example: "Kelvin Mang x Mang Hao Jian"
  const q = (rawQuery || "").trim();
  const m = q.match(/^(.*?)\s+x\s+(.*)$/i);

  if (!m) {
    // If there is no delimiter in the user's input, just search the query as-is.
    // Backend role filtering (before/after x in the calendar record) will handle correctness.
    return q;
  }

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
  sub.textContent = subText || "Select the correct name to show today's lessons.";

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

  // Clicking outside the modal cancels.
  overlay.addEventListener("click", e => {
    if (e.target === overlay) onCancel();
  });

  document.body.appendChild(overlay);
  return overlay;
}