# CyberSec Terminal Portfolio

A React + Vite personal cybersecurity portfolio with:
- Neon-green terminal-inspired interface and boot animation
- Live public GitHub profile stats and repository cards
- Manual learning log and featured project cards
- LinkedIn and TryHackMe profile links
- Responsive layout

## 1. Requirements
Node.js 20.19+ (or 22.12+) and npm. Check:
```bash
node -v
npm -v
```

## 2. Run locally
```bash
cd cybersec-terminal-portfolio
npm install
npm run dev
```
Open the local URL printed by Vite, usually http://localhost:5173.

## 3. Personalize
Edit `src/data.js`:
- `profile.linkedin`: replace with your real LinkedIn profile URL.
- `profile.tryhackme`: replace with your real TryHackMe profile URL.
- `profile.name`, role, location, focus areas.
- `featuredProjects`: update project descriptions and links.
- `learningLog`: update your learning progress.
The GitHub username is currently `yadav2aman23`.

## 4. Test production build
```bash
npm run build
npm run preview
```

## 5. Publish for free on Vercel
1. Create a new public GitHub repository, e.g. `cybersec-terminal-portfolio`.
2. From this project folder:
```bash
git init
git add .
git commit -m "Build cybersecurity portfolio"
git branch -M main
git remote add origin https://github.com/yadav2aman23/cybersec-terminal-portfolio.git
git push -u origin main
```
3. Sign in at https://vercel.com with GitHub.
4. Import the new repository. Vercel should detect Vite automatically.
5. Keep build command `npm run build` and output directory `dist`, then deploy.
6. Vercel gives you a free `*.vercel.app` URL and HTTPS on the free Hobby plan for personal projects.

If the repository already exists, do not run `git remote add origin` again. Use the repository URL you created.

## Notes on updates
- Public GitHub repository data is fetched directly from the GitHub REST API and refreshes every 15 minutes while the page is open.
- The GitHub unauthenticated API has rate limits; this small portfolio should generally be fine for normal personal use.
- LinkedIn and TryHackMe links are manual because live profile data depends on official API access and permissions. Do not put private tokens in frontend code.
- The learning log and featured projects are edited in `src/data.js`.
