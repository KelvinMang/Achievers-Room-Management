# Deploy notes — Student / Tutor / Staff (same website)

Yes — this works on **GitHub Pages**. One static site; access is split by URL query params. Calendar data still comes from Google Apps Script (not from the static host).

## Links (same GitHub Pages site)

| Who | Link | What they see |
| --- | --- | --- |
| **Students (share this)** | `https://YOUR_GITHUB_PAGES_URL/` | Student search + Today/Tomorrow. Name picker if several match. Help text to visit 1012. No Floor board. |
| **Tutors** | `https://YOUR_GITHUB_PAGES_URL/?tutor=YOUR_TUTOR_KEY` | Tutor-name search only (find their rooms). No Floor board. |
| **Staff / reception kiosk** | `https://YOUR_GITHUB_PAGES_URL/?staff=YOUR_STAFF_KEY` | Floor board + Student/Tutor search + **Room availability** (password-gated). |

Keys live in [`app.js`](./app.js) and [`Code.gs`](./Code.gs) — keep them identical. **Do not put real keys or the availability password in the README.**

## 1. Update Google Apps Script

1. Replace `Code.gs` with the repo file [`Code.gs`](./Code.gs).
2. Confirm `STAFF_KEY` / `TUTOR_KEY` match `app.js`.
3. Set the Apps Script project timezone to **Hong Kong** (File → Project settings) if possible.
4. **Project Settings → Script properties** → add:
   - Property: `AVAILABILITY_PASSWORD`
   - Value: the availability unlock password (do **not** commit this value to GitHub)
5. Share these calendars with the Apps Script owner:
   - Helios 13/F: `admissions@helios-edu.com`
   - Wan Chai / 10/F: `admin@achievershk.com` ([embed](https://calendar.google.com/calendar/embed?src=admin%40achievershk.com&ctz=Asia%2FHong_Kong))
   - For **reading** availability: at least “See all event details”
   - For **creating** bookings from the portal: “Make changes to events” (or higher) on both calendars
   Availability merges both so a room booked only on the 10/F calendar still shows as occupied. Tracked rooms: CEO Room, 1309A–E/G, 1012B, 804D, 804F.
6. **Deploy → Manage deployments → Edit → New version → Deploy**.
   - Execute as: **Me**
   - Who has access: **Anyone**
7. If the `/exec` URL changes, update `API_URL` in `app.js`.

### Why event details still work on GitHub Pages

GitHub Pages only hosts the static UI. Availability login and calendar reads run on Apps Script:

1. Staff open the staff URL.
2. UI POSTs password to Apps Script (`text/plain` JSON) and receives a short-lived session token.
3. UI GETs availability with `key` + `token`.
4. Apps Script returns Free/Busy + event titles/times only to authenticated sessions.

The password is **not** stored in the frontend. The token lives in `sessionStorage` and expires after about 6 hours (or when the tab is closed).

## 2. Push the frontend (GitHub Pages)

Push to `main`. [`.github/workflows/static.yml`](./.github/workflows/static.yml) deploys the site automatically.

## 3. Smoke tests

**Student link**

- Partial name → picker if several people match
- `Dan` should find lessons (not a dead `Dan, Dan` choice)
- Help note about Room 1012 is visible

**Tutor link (`?tutor=...`)**

- Searches tutor side of titles / `Tutor:` description
- No Floor board tab

**Staff link (`?staff=...`)**

- Floor board + Student/Tutor search
- **Room availability**:
  - Password modal appears before data loads
  - Wrong password is rejected
  - After unlock: **Free now** grouped by 13/F · 10/F · 8/F
  - Tap a room → day timeline (Google Calendar–style blocks + current-time line)
  - Drag an empty slot → create booking (title + Helios and/or Wan Chai calendars)
  - Tap an event block → title/time details
  - **Check a timeslot** → Free/Busy for the selected window
  - Lock clears the session; expired tokens ask for the password again
