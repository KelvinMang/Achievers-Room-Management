# Deploy notes — Student / Tutor / Staff (same website)

Yes — this works on **GitHub Pages**. One static site; access is split by URL query params.

## Links (same GitHub Pages site)

| Who | Link | What they see |
| --- | --- | --- |
| **Students (share this)** | `https://YOUR_GITHUB_PAGES_URL/` | Student search + Today/Tomorrow. Name picker if several match. Help text to visit 1012. No Floor board. |
| **Tutors** | `https://YOUR_GITHUB_PAGES_URL/?tutor=YOUR_TUTOR_KEY` | Tutor-name search only (find their rooms). No Floor board. |
| **Staff / reception kiosk** | `https://YOUR_GITHUB_PAGES_URL/?staff=YOUR_STAFF_KEY` | Floor board + Student/Tutor search. |

Keys live in [`app.js`](./app.js) and [`Code.gs`](./Code.gs) — keep them identical. **Do not put real keys in the README.**

## 1. Update Google Apps Script

1. Replace `Code.gs` with the repo file [`Code.gs`](./Code.gs).
2. Confirm `STAFF_KEY` / `TUTOR_KEY` match `app.js`.
3. Set the Apps Script project timezone to **Hong Kong** (File → Project settings) if possible.
4. **Deploy → Manage deployments → Edit → New version → Deploy**.
5. If the `/exec` URL changes, update `API_URL` in `app.js`.

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
