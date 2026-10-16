import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { profile as baseProfile, focusAreas, featuredProjects, learningLog, leadership, otherHighlights } from "./data.js";

const initialContent = {
  profile: { ...baseProfile, headline: "Cybersecurity Learner | Network Security | DFIR", about: "I am building practical skills in cybersecurity, network analysis, digital forensics, and web security through hands-on labs and documented projects." },
  projects: featuredProjects.map((p, i) => ({ id: `project-${i + 1}`, ...p, liveUrl: "", imageUrl: "", published: true })),
  skills: focusAreas.map((name, i) => ({ id: `skill-${i + 1}`, name, category: "Core Skills", level: "Learning" })),
  labs: learningLog.map((l, i) => ({ id: `lab-${i + 1}`, title: l.title, description: l.text, platform: "Personal Lab", status: l.status, url: "" })),
  events: leadership.map((e, i) => ({ id: `event-${i + 1}`, title: e.event, role: e.role, description: e.description, date: "", imageUrl: e.image || "", link: "" })),
  photos: otherHighlights.map((e, i) => ({ id: `photo-${i + 1}`, title: e.title, caption: e.description, imageUrl: e.image || "", alt: e.title })),
  links: [
    { id: "link-github", label: "GitHub", url: `https://github.com/${baseProfile.username}`, kind: "Code" },
    { id: "link-linkedin", label: "LinkedIn", url: baseProfile.linkedin, kind: "Professional" },
    { id: "link-tryhackme", label: "TryHackMe", url: baseProfile.tryhackme, kind: "Labs" },
  ],
};

function SectionHeading({ index, label, title, intro }) {
  return <div className="section-heading"><span className="eyebrow">{index} / {label}</span><h2>{title}</h2>{intro && <p>{intro}</p>}</div>;
}

function getPhotoSrc(url) {
  if (!url) return "";
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
    || url.match(/[?&]id=([^&]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  return url;
}

function ExternalLink({ href, children, className = "text-link" }) {
  if (!href) return null;
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children} <span aria-hidden="true">↗</span></a>;
}

export default function App() {
  const [content, setContent] = useState(initialContent);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubStatus, setGithubStatus] = useState("loading");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => onAuthStateChanged(auth, (user) => setCurrentUser(user)), []);
  useEffect(() => {
    let alive = true;
    getDoc(doc(db, "portfolioPublished", "siteContent"))
      .then((snap) => { if (alive && snap.exists() && snap.data().content) setContent((old) => ({ ...old, ...snap.data().content })); })
      .catch((err) => console.info("Published portfolio content unavailable; showing local defaults.", err.code || err.message))
      .finally(() => { if (alive) setContentLoaded(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/users/${content.profile?.username || baseProfile.username}/repos?sort=pushed&direction=desc&per_page=6&type=owner`, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => { if (!r.ok) throw new Error("GitHub API unavailable"); return r.json(); })
      .then((data) => { if (alive) { setGithubRepos(data.filter((r) => !r.fork).slice(0, 6)); setGithubStatus("ready"); } })
      .catch(() => { if (alive) setGithubStatus("error"); });
    return () => { alive = false; };
  }, [content.profile?.username]);

  const p = content.profile || baseProfile;
  const visibleProjects = useMemo(() => (content.projects || []).filter((x) => x.published !== false), [content.projects]);
  const socials = content.links || [];

  return <div className={`site-shell portfolio-redesign${p.backgroundAnimation === false ? " animations-off" : " animations-on"}`}>
    <div className="topline"><span><i className="status-dot" /> ALL SYSTEMS OPERATIONAL</span><span>SECURITY PORTFOLIO <b>v2.0</b></span></div>
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Portfolio home"><span className="brand-mark">AC</span><span>aman<span className="brand-muted">.sec</span><small>CYBERSECURITY PORTFOLIO</small></span></a>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">☰</button>
      <nav className={menuOpen ? "main-nav open" : "main-nav"}>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a><a href="#labs" onClick={() => setMenuOpen(false)}>Lab Journal</a><a href="#skills" onClick={() => setMenuOpen(false)}>Skills</a><a href="#events" onClick={() => setMenuOpen(false)}>Events</a><a href="#events" onClick={() => setMenuOpen(false)}>Achievements</a><a href="#events" onClick={() => setMenuOpen(false)}>Gallery</a><a href="#contact" onClick={() => setMenuOpen(false)} className="nav-contact">Contact ↗</a>
      </nav>
    </header>

    <main>
      <section id="home" className={`hero section-wrap${p.backgroundAnimation === false ? " animations-off" : " animations-on"}`}>
        <div className="profile-photo-wrap">
          {p.photoUrl && <img className="profile-photo" src={getPhotoSrc(p.photoUrl)} alt={`${p.name || baseProfile.name} profile`} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.dataset.failed = "true"; }} />}
          {!p.photoUrl && <div className="profile-photo-placeholder"><span>AC</span></div>}
          <span className="profile-availability"><i className="status-dot" /> Available for Opportunities</span>
        </div>
        <div className="hero-copy"><div className="availability"><span className="status-dot" /> OPEN TO LEARNING & COLLABORATION</div>
          <p className="hero-kicker">HELLO WORLD, I'M</p><h1>{p.name || baseProfile.name}<span className="accent">.</span></h1>
          <h2>{p.headline || p.role || "Cybersecurity Learner"}</h2>
          <p className="hero-description">{p.tagline || "Learning cybersecurity, investigating digital evidence, and building safer technology."}</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">Explore my work <span>↘</span></a><a className="button button-secondary" href="#contact">Get in touch</a></div>
          <div className="hero-meta"><span><b>01</b> HANDS-ON LEARNING</span><span><b>02</b> DOCUMENTED PROJECTS</span><span><b>03</b> RESPONSIBLE SECURITY</span></div>
        </div>
        <div className="hero-terminal" aria-label="Terminal-style profile card"><div className="terminal-title"><div className="window-dots"><i/><i/><i/></div><span>aman@sec-lab:~</span><span className="terminal-lock">⌁</span></div><div className="terminal-content"><p className="terminal-muted">$ whoami</p><h3>{p.name || baseProfile.name}</h3><p className="terminal-green">{p.role || "Cybersecurity Learner"}</p><div className="terminal-line"/><p className="terminal-muted">$ cat focus_areas.txt</p><ul>{(content.skills || []).slice(0, 5).map((s) => <li key={s.id || s.name}><span>›</span> {s.name}</li>)}</ul><div className="terminal-line"/><p className="terminal-muted">$ echo $STATUS</p><p className="terminal-green">LEARNING · BUILDING · DOCUMENTING<span className="cursor">_</span></p></div><div className="terminal-footer"><span><i className="status-dot"/> LOCAL LAB READY</span><span>INDIA / {p.location || "INDIA"}</span></div></div>
        <div className="hero-grid-glow" aria-hidden="true" />
      </section>

      <section className="portfolio-stats section-wrap" aria-label="Portfolio highlights">
        <div className="portfolio-stat"><span className="stat-icon">🎓</span><div><strong>{(content.projects || []).length}+</strong><small>Projects & Builds</small></div></div>
        <div className="portfolio-stat"><span className="stat-icon">⬡</span><div><strong>{(content.skills || []).length}+</strong><small>Skills & Tools</small></div></div>
        <div className="portfolio-stat"><span className="stat-icon">▤</span><div><strong>{(content.labs || []).length}+</strong><small>Labs & Write-ups</small></div></div>
        <div className="portfolio-stat"><span className="stat-icon">♟</span><div><strong>{(content.events || []).length}+</strong><small>Workshops / Events</small></div></div>
        <div className="portfolio-stat"><span className="stat-icon">☆</span><div><strong>Always</strong><small>Learning & Growing</small></div></div>
      </section>

      <section id="about" className="section-wrap section-block"><SectionHeading index="01" label="ABOUT" title="Curiosity into capability." intro="A practical, evidence-first approach to learning security."/><div className="about-grid"><div className="about-main"><p>{p.about || "I am learning how systems communicate, how vulnerabilities happen, and how to investigate activity using logs and network evidence. My goal is to build reliable skills through authorized labs, clear documentation, and projects that solve real problems."}</p><p className="muted-copy">I focus on understanding the fundamentals, recording what I learn, and practising only in systems where I have permission.</p></div><div className="about-stats"><div><strong>{visibleProjects.length.toString().padStart(2, "0")}</strong><span>FEATURED PROJECTS</span></div><div><strong>{(content.labs || []).length.toString().padStart(2, "0")}</strong><span>LAB NOTES</span></div><div><strong>{(content.events || []).length.toString().padStart(2, "0")}</strong><span>EVENT HIGHLIGHTS</span></div></div></div></section>

      <section id="projects" className="section-wrap section-block portfolio-projects"><SectionHeading index="02" label="SELECTED WORK" title="Projects with a purpose." intro="A selection of projects across IoT, software, and security learning."/><div className="project-grid">{visibleProjects.map((project, i) => <article className="project-card" key={project.id || project.name}><div className="project-card-top"><span className="project-number">PROJECT_{String(i + 1).padStart(2, "0")}</span><span className="project-icon">⌘</span></div>{project.imageUrl && <img className="project-image" src={getPhotoSrc(project.imageUrl)} alt={project.name} loading="lazy"/>}<h3>{project.name || project.title}</h3><p>{project.description}</p><div className="tag-list">{(project.tags || project.techStack || []).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="card-links"><ExternalLink href={project.url || project.githubUrl}>Source code</ExternalLink><ExternalLink href={project.liveUrl}>Live demo</ExternalLink></div></article>)}</div></section>

      <section id="labs" className="section-wrap section-block"><SectionHeading index="03" label="LAB JOURNAL" title="Learn. Test. Document." intro="A learning log for practical labs and technical investigation."/><div className="lab-list">{(content.labs || []).map((lab, i) => <article className="lab-row" key={lab.id || lab.title}><span className="lab-index">{String(i + 1).padStart(2, "0")}</span><div className="lab-body"><div className="lab-title-line"><h3>{lab.title}</h3><span className="lab-status">{lab.status || "IN PROGRESS"}</span></div><p>{lab.description || lab.text}</p>{lab.platform && <span className="lab-platform">PLATFORM / {lab.platform}</span>}{lab.url && <div><ExternalLink href={lab.url}>Open lab notes</ExternalLink></div>}</div><span className="lab-arrow">↗</span></article>)}</div></section>

      <section id="skills" className="section-wrap section-block portfolio-skills"><SectionHeading index="04" label="TOOLKIT" title="Skills under development." intro="A growing toolkit, built through practice rather than claims."/><div className="skills-grid">{Object.entries((content.skills || []).reduce((acc, skill) => { const category = skill.category || "Core Skills"; (acc[category] ||= []).push(skill); return acc; }, {})).map(([category, skills]) => <div className="skill-panel" key={category}><h3><span>⌁</span> {category}</h3>{skills.map((skill) => <div className="skill-item" key={skill.id || skill.name}><span>{skill.name}</span><small>{skill.level || "Learning"}</small></div>)}</div>)}</div></section>

      <section id="events" className="section-wrap section-block portfolio-achievements"><SectionHeading index="05" label="COMMUNITY & EVENTS" title="Learning beyond the screen." intro="Workshops, coordination, hackathons, and experiences that shape the journey."/><div className="event-grid">{(content.events || []).map((event, i) => <article className="event-card" key={event.id || event.title}>{event.imageUrl && <img src={getPhotoSrc(event.imageUrl)} alt={event.title} loading="lazy"/>}<div className="event-content"><span className="eyebrow">EVENT_{String(i + 1).padStart(2, "0")} {event.date && ` / ${event.date}`}</span><h3>{event.title || event.event}</h3>{event.role && <p className="event-role">{event.role}</p>}<p>{event.description}</p><ExternalLink href={event.link}>Event details</ExternalLink></div></article>)}</div>{(content.photos || []).length > 0 && <div className="photo-grid">{content.photos.map((photo) => <figure key={photo.id || photo.title}>{photo.imageUrl && <img src={getPhotoSrc(photo.imageUrl)} alt={photo.alt || photo.title} loading="lazy"/>}<figcaption><strong>{photo.title}</strong><span>{photo.caption}</span></figcaption></figure>)}</div>}</section>

      <section className="section-wrap section-block github-section portfolio-github"><div><SectionHeading index="06" label="OPEN SOURCE" title="Activity from GitHub." intro="Recent public repositories pulled from GitHub when available."/></div><div className="github-list">{githubStatus === "loading" && <p className="muted-copy">Connecting to GitHub API…</p>}{githubStatus === "error" && <p className="muted-copy">Live repository data is unavailable right now. Visit the GitHub profile for the latest work.</p>}{githubRepos.map((repo) => <a className="github-row" href={repo.html_url} target="_blank" rel="noreferrer" key={repo.id}><span><strong>{repo.name}</strong><small>{repo.description || "No description provided yet."}</small></span><span className="repo-meta">{repo.language || "Code"}　★ {repo.stargazers_count}　↗</span></a>)}<ExternalLink href={`https://github.com/${p.username || baseProfile.username}`}>View GitHub profile</ExternalLink></div></section>

      <section id="contact" className="section-wrap contact-section portfolio-contact"><div className="contact-card"><span className="eyebrow">07 / CONTACT</span><h2>Have a project or idea?</h2><p>Let's connect, exchange ideas, and keep learning how to make technology safer.</p><div className="contact-actions">{p.email && <a className="button button-primary" href={`mailto:${p.email}`}>Email me ↗</a>}{socials.map((link) => <ExternalLink key={link.id || link.label} href={link.url} className="button button-secondary">{link.label}</ExternalLink>)}</div></div></section>
    </main>

    <footer className="site-footer section-wrap"><a className="brand footer-brand" href="#home"><span className="brand-mark">AC</span><span>aman<span className="brand-muted">.sec</span><small>BUILDING SKILLS, ONE LAB AT A TIME</small></span></a><span>© {new Date().getFullYear()} {p.name || baseProfile.name}</span><button className="admin-access" onClick={() => currentUser ? setShowAdmin(true) : setShowLogin(true)}>{currentUser ? "OPEN CMS ↗" : "ADMIN ACCESS ↗"}</button></footer>
    {!contentLoaded && <div className="load-indicator" aria-live="polite">SYNCING PUBLISHED CONTENT…</div>}
    {notice && <div className="toast" role="status">{notice}</div>}
    {showLogin && <AdminLogin onAdminLogin={() => { setShowLogin(false); setShowAdmin(true); }} onClose={() => setShowLogin(false)} />}
    {showAdmin && currentUser && <AdminDashboard adminUid={currentUser.uid} onClose={() => setShowAdmin(false)} onPublished={(next) => { setContent((old) => ({ ...old, ...next })); setNotice("Published content is now live."); setTimeout(() => setNotice(""), 3500); }} />}
  </div>;
}
