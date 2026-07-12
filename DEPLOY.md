# Deploy notes — Student link + Staff / kiosk (same website)

Yes — this works on **GitHub Pages**. It is still one static site. Students and staff use the **same URL**, with staff unlocking extra features via a query param.

## Links (same GitHub Pages site)

| Who | Link | What they see |
| --- | --- | --- |
| **Students (share this)** | `https://YOUR_GITHUB_PAGES_URL/` | Full-name search only. No Floor board. No tutor search. Results hide full calendar titles. |
| **Staff / reception kiosk** | `https://YOUR_GITHUB_PAGES_URL/?staff=YOUR_STAFF_KEY` | Floor board + Student/Tutor search. |

`STAFF_KEY` lives in [`app.js`](./app.js) and [`Code.gs`](./Code.gs) — keep them identical. **Do not put the real staff key or staff URL in the README** (public repos expose it).

> Note: a key in frontend source is not bank-grade security. Apps Script still **rejects** board/tutor access without the key, which stops casual misuse from the student link.

## 1. Update Google Apps Script

1. Replace `Code.gs` with the repo file [`Code.gs`](./Code.gs).
2. Confirm `STAFF_KEY` matches `app.js`.
3. **Deploy → Manage deployments → Edit → New version → Deploy**.
4. If the `/exec` URL changes, update `API_URL` in `app.js`.

## 2. Push the frontend (GitHub Pages)

Push to `main`. [`.github/workflows/static.yml`](./.github/workflows/static.yml) deploys the site automatically.

## 3. Smoke tests

**Student link (no `?staff=`):**

- Floor board tabs are hidden
- Searching a partial name (e.g. `Jayden`) → name picker if several match
- After choosing a name → only that student’s time/room (no full lesson title)

**Staff link (`?staff=...`):**

- Mode switch appears (Find my lesson | Floor board)
- Tutor search works
- Floor board loads

**API checks:**

```
YOUR_API_URL?mode=board
→ { "error": "Staff access required", ... }

YOUR_API_URL?mode=board&key=YOUR_STAFF_KEY
→ { "date": "...", "floors": { ... } }

YOUR_API_URL?mode=search&name=Peter&role=student
→ full-name error

YOUR_API_URL?mode=search&name=Peter%20Chan&role=student
→ results without title
```
