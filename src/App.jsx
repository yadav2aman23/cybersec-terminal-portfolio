import AdminLogin from "./AdminLogin";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";




import { useEffect, useState } from "react";

import {
  profile,
  focusAreas,
  featuredProjects,
  learningLog,
  leadership,
  otherHighlights,
} from "./data.js";


function BootScreen({ onFinish }) {
  const lines = [
    "Initializing portfolio environment...",
    "Loading profile configuration...",
    "Connecting to public GitHub API...",
    "Preparing security learning log...",
    "Terminal interface ready."
  ];
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers = lines.map((_, i) =>
      setTimeout(() => setVisible(i + 1), 360 * (i + 1))
    );
    const finish = setTimeout(onFinish, 2300);
    return () => { timers.forEach(clearTimeout); clearTimeout(finish); };
  }, []);

  return (
    <div className="boot-screen">
      <div className="boot-window">
        <div className="window-top"><span></span><span></span><span></span><b>aman@portfolio:~</b></div>
        <div className="boot-body">
          <div className="boot-logo">[ AC ]</div>
          <p className="muted">CYBERSECURITY PORTFOLIO // BOOT SEQUENCE</p>
          {lines.slice(0, visible).map((line, i) => (
            <p className="boot-line" key={line}><span>[ OK ]</span> {line}</p>
          ))}
          <div className="progress-track"><div className="progress-fill" style={{ width: `${visible / lines.length * 100}%` }} /></div>
          <p className="boot-hint">Press enter to continue <span className="cursor">_</span></p>

        </div>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, number }) {
  return <div className="section-title"><span>{number} / {eyebrow}</span><h2>{title}</h2></div>;
}

function App() {
  const [booting, setBooting] = useState(true);
  const [repos, setRepos] = useState([]);
  const [githubUser, setGithubUser] = useState(null);
  const [repoState, setRepoState] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  async function loadGitHub() {
    setRepoState("loading");
    try {
      const headers = { Accept: "application/vnd.github+json" };
      const [userRes, repoRes] = await Promise.all([
        fetch(`https://api.github.com/users/${profile.username}`, { headers }),
        fetch(`https://api.github.com/users/${profile.username}/repos?sort=pushed&direction=desc&per_page=6&type=owner`, { headers })
      ]);
      if (!userRes.ok || !repoRes.ok) throw new Error("GitHub API request failed");
      const userData = await userRes.json();
      const repoData = await repoRes.json();
      setGithubUser(userData);
      setRepos(repoData.filter((repo) => !repo.fork).slice(0, 6));
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setRepoState("ready");
    } catch {
      setRepoState("error");
    }
  }

  useEffect(() => {
    loadGitHub();
    const refresh = setInterval(loadGitHub, 15 * 60 * 1000);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    if (!booting) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [booting]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);


  if (booting) return <BootScreen onFinish={() => setBooting(false)} />;

  return (
    <div className="app-shell">
      <div className="scanlines" aria-hidden="true" />
      <header className="navbar">
        <a className="brand" href="#home"><span className="brand-mark">AC</span><span>AMAN<span className="brand-dot">.</span>SEC</span></a>
        <nav>

          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#labs">Learning Log</a>
          <a href="#leadership">Leadership</a>
          <a href="#other">Other</a>
          <a href="#connect">Connect</a>

        </nav>
        <a className="status-pill" href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer"><span className="status-dot" /> SYSTEM ONLINE</a>

        <button
          type="button"
          className="status-pill"
          onClick={() => {
            if (currentUser) {
              signOut(auth);
            } else {
              setShowAdminLogin(true);
            }
          }}
        >
          {currentUser ? "ADMIN LOGOUT" : "ADMIN LOGIN"}
        </button>

      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="tiny-pulse" /> AVAILABLE FOR LEARNING & COLLABORATION</div>
            <h1>Hi, I'm <span className="green-text">{profile.name}.</span><br />I explore the <span className="outline-text">digital</span><br />frontier<span className="green-text">_</span></h1>
            <p className="hero-sub">{profile.tagline}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#projects">Explore my work <span>↘</span></a>
              <a className="btn btn-secondary" href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer">GitHub profile ↗</a>
            </div>
            <div className="hero-meta"><span><b>LOCATION</b> {profile.location}</span><span><b>MODE</b> Always learning</span></div>
          </div>
          <div className="terminal-card">
            <div className="terminal-head"><div className="traffic"><i /><i /><i /></div><span>~/aman/profile.sh</span><span className="terminal-lock">▣</span></div>
            <div className="terminal-content">
              <p><span className="prompt">aman@kali</span>:<span className="path">~</span>$ whoami</p>
              <h3>{profile.role}</h3>
              <p><span className="prompt">aman@kali</span>:<span className="path">~</span>$ cat mission.txt</p>
              <p className="terminal-output">Understand. Investigate.<br />Secure. Repeat.</p>
              <p><span className="prompt">aman@kali</span>:<span className="path">~</span>$ ls focus/</p>
              <div className="terminal-tags">{focusAreas.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>
              <p className="terminal-last"><span className="prompt">aman@kali</span>:<span className="path">~</span>$ <span className="cursor">█</span></p>
            </div>
            <div className="terminal-footer"><span>UTF-8</span><span>bash</span><span>100%</span><span>Ln 01, Col 01</span></div>
          </div>
          <div className="hero-grid-mark" aria-hidden="true">＋</div>
        </section>

        <section className="stats-band">
          <div><span className="stat-label">PUBLIC REPOSITORIES</span><strong>{githubUser ? githubUser.public_repos : "—"}</strong><small>GitHub profile data</small></div>
          <div><span className="stat-label">FOLLOWERS</span><strong>{githubUser ? githubUser.followers : "—"}</strong><small>Community connections</small></div>
          <div><span className="stat-label">CORE FOCUS</span><strong>DFIR<span className="green-text">+</span></strong><small>Investigate and learn</small></div>
          <div><span className="stat-label">PROFILE STATUS</span><strong className="online-text">ONLINE</strong><small><span className="status-dot" /> Public portfolio</small></div>
        </section>

        <section className="section-wrap content-section" id="about">
          <SectionTitle number="01" eyebrow="IDENTITY" title="Curious by design." />
          <div className="about-grid">
            <div className="about-copy"><p className="lead">I'm a cybersecurity learner building practical skills one lab, packet, and project at a time.</p><p>I’m especially interested in how networks behave, how incidents leave traces, and how security tools help us investigate them. This site is my public learning journal — a place to share projects, practice, and progress honestly.</p><p className="small-note">// Learning in authorized environments. Documenting as I go.</p></div>
            <div className="focus-panel"><div className="panel-head"><span>FOCUS_AREAS.json</span><span>●</span></div><div className="focus-list">{focusAreas.map((area, i) => <div key={area}><span className="focus-index">0{i + 1}</span><span>{area}</span><span className="focus-arrow">↗</span></div>)}</div></div>
          </div>
        </section>

        <section className="section-wrap content-section" id="projects">
          <SectionTitle number="02" eyebrow="REPOSITORIES" title="Built, pushed, documented." />
          <div className="section-intro-row"><p className="section-intro">Public GitHub repositories, fetched automatically from the GitHub API.</p><a className="text-link" href={`https://github.com/${profile.username}?tab=repositories`} target="_blank" rel="noreferrer">VIEW ALL ON GITHUB ↗</a></div>
          {repoState === "loading" && <div className="notice"><span className="spinner" /> Querying GitHub API...</div>}
          {repoState === "error" && <div className="notice error">Could not load GitHub data right now. Check your connection or open the GitHub profile directly. <button onClick={loadGitHub}>Retry ↻</button></div>}
          {repoState === "ready" && repos.length === 0 && <div className="notice">No public non-fork repositories found yet. Add public projects to GitHub and they will appear here.</div>}
          {repoState === "ready" && repos.length > 0 && <div className="repo-grid">{repos.map((repo) => <article className="repo-card" key={repo.id}><div className="repo-top"><span className="repo-icon">⌘</span><span className="repo-public">PUBLIC REPO</span><a href={repo.html_url} target="_blank" rel="noreferrer" aria-label={`Open ${repo.name}`}>↗</a></div><h3><a href={repo.html_url} target="_blank" rel="noreferrer">{repo.name}</a></h3><p>{repo.description || "A public repository. Open it on GitHub to explore the source and documentation."}</p><div className="repo-meta"><span>{repo.language && <><i className="language-dot" /> {repo.language}</>}</span><span>☆ {repo.stargazers_count}</span><span>⑂ {repo.forks_count}</span></div><div className="repo-updated">PUSHED {repo.pushed_at ? new Date(repo.pushed_at).toLocaleDateString() : "DATE UNKNOWN"}</div></article>)}</div>}
          <div className="api-footnote">SOURCE: api.github.com/users/{profile.username}/repos {lastUpdated && `· LAST FETCH ${lastUpdated}`} · REFRESHES EVERY 15 MINUTES WHILE PAGE IS OPEN</div>
        </section>

        <section className="section-wrap content-section" id="labs">
          <SectionTitle number="03" eyebrow="LEARNING LOG" title="Progress over perfection." />
          <p className="section-intro">A small, honest snapshot of what I’m practising. Update this list in <code>src/data.js</code> as your journey progresses.</p>
          <div className="timeline">{learningLog.map((item, i) => <article className="timeline-item" key={item.title}><div className="timeline-marker">{String(i + 1).padStart(2, "0")}</div><div className="timeline-date">{item.date}</div><div className="timeline-main"><h3>{item.title}</h3><p>{item.text}</p></div><span className="timeline-status">{item.status}</span></article>)}</div>
          <div className="featured-grid">{featuredProjects.map((project) => <article className="featured-card" key={project.name}><div className="featured-symbol">⌁</div><h3>{project.name}</h3><p>{project.description}</p><div className="tag-row">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a href={project.url} target="_blank" rel="noreferrer">Explore project ↗</a></article>)}</div>
        </section>

        <section className="section-wrap content-section" id="leadership">
          <SectionTitle
            number="04"
            eyebrow="LEADERSHIP"
            title="Coordination & teamwork."
          />
          <div className="featured-grid">
            {leadership.map((item, index) => (
              <article className="featured-card" key={`${item.title}-${index}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="highlight-image"
                />
                <h3>{item.title}</h3>
                <p><strong>{item.role}</strong></p>
                <p>{item.event}</p>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-wrap content-section" id="other">
          <SectionTitle
            number="05"
            eyebrow="MORE"
            title="Other highlights."
          />
          <div className="featured-grid">
            {otherHighlights.map((item, index) => (
              <article className="featured-card" key={`${item.title}-${index}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="highlight-image"
                />
                <h3>{item.title}</h3>
                {item.date && <p>{item.date}</p>}
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>


        <section className="connect-section" id="connect"><div className="section-wrap connect-inner"><div><div className="eyebrow"><span className="tiny-pulse" /> OPEN TO CONNECT</div><h2>Let's learn.<br /><span className="green-text">Let's build.</span></h2><p>Have a project, lab recommendation, or cybersecurity learning resource to share? Find me online.</p></div><div className="social-links"><a href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer"><span>⌘</span><div><b>GitHub</b><small>@{profile.username}</small></div><span className="social-arrow">↗</span></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><span>in</span><div><b>LinkedIn</b><small>Professional profile</small></div><span className="social-arrow">↗</span></a><a href={profile.tryhackme} target="_blank" rel="noreferrer"><span>⌖</span><div><b>TryHackMe</b><small>Labs & practice</small></div><span className="social-arrow">↗</span></a></div></div></section>
      </main>

      {showAdminLogin && (
        <AdminLogin
          onAdminLogin={() => setShowAdminLogin(false)}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      <footer className="footer"><a className="brand" href="#home"><span className="brand-mark">AC</span><span>AMAN<span className="brand-dot">.</span>SEC</span></a><span>Built with curiosity & code.</span><a href="#home">BACK TO TOP ↑</a></footer>
    </div>
  );
}

export default App;