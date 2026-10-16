# Dark Cybersecurity Portfolio + Draft/Publish CMS

## What changed
- Rebuilt `src/App.jsx` as a responsive dark cybersecurity portfolio.
- Rebuilt `src/AdminDashboard.jsx` as a complete CMS for profile, projects, skills, labs, events, photos and links.
- Rebuilt `src/style.css` for a consistent dark navy/cyan terminal-inspired UI.
- Kept `src/firebase.js`, `src/AdminLogin.jsx`, `src/data.js`, `src/main.jsx`, `package.json`, and the lockfile from the supplied project.
- Added `firestore.rules` as a reference rules file. Review and deploy it in Firebase Console only after verifying the admin UID.

## Important data safety notes
- Existing local content from `src/data.js` is used as starter content.
- Existing Firestore `portfolio/leadership` is read and mapped into the draft as an event if it is not already present. The original document is not deleted or overwritten by this CMS.
- Public site reads `portfolioPublished/siteContent` only. Admin draft is stored separately at `portfolioDrafts/siteContent`.
- `Save Draft` never updates the public version. `Publish` requires a confirmation and writes the published snapshot.
- Images are configured by URL; this avoids making Firebase Storage uploads a requirement.

## Apply the update
1. Make a backup of your current project folder and Firestore data.
2. Extract this ZIP to a temporary folder.
3. Copy the provided `src/App.jsx`, `src/AdminDashboard.jsx`, and `src/style.css` into your project's `src/` folder, replacing those files.
4. Keep your current `src/firebase.js`, `src/AdminLogin.jsx`, `src/data.js`, `src/main.jsx`, `package.json`, and `package-lock.json` unless you have a separate reason to change them.
5. In `src/AdminLogin.jsx`, verify `ADMIN_UID` is your actual Firebase Authentication UID. Do not use an email address here.
6. Review `firestore.rules`. The admin UID in the sample rules must exactly match the UID in `AdminLogin.jsx`. Deploy rules only after review; incorrect rules can block the CMS.
7. Install dependencies with `npm ci` and run `npm run dev`; run `npm run build` before deployment.
8. Sign in to Admin Access. Add/edit content, click `Apply to editor`, then `Save Draft`. Use `Preview draft`, and click `Publish` only when ready.

## Firestore document model
- `portfolioDrafts/siteContent`: `{ content, status, updatedAt, updatedBy }`
- `portfolioPublished/siteContent`: `{ content, status, publishedAt, publishedBy }`
- `portfolio/leadership`: existing legacy record; retained for compatibility.

## Security warning
Firestore rules are the actual authorization boundary. Hiding admin controls in React is not security. Test with a logged-out browser and an ordinary signed-in account before deploying. Public read access is intentionally limited to the published snapshot; drafts and the legacy leadership document are admin-only in the sample rules.
