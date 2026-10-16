
import { useCallback, useEffect, useState } from "react";
import PortfolioApp from "./PortfolioApp";
import "./welcome.css";

const bootLines = [
  "Initializing portfolio modules...",
  "Establishing secure connection...",
  "Loading profile data...",
  "Scanning project directory...",
  "Verifying security protocols...",
  "Loading skills and achievements...",
  "Encrypting session...",
  "All systems operational."
];

function WelcomeScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const duration = 6500;

    const timer = window.setInterval(() => {
      const value = Math.min(
        100,
        Math.floor(((Date.now() - start) / duration) * 100)
      );

      setProgress(value);
      setLineCount(
        Math.min(bootLines.length, Math.floor(value / 13) + 1)
      );
      setOnline(value >= 100);

      if (value >= 100) {
        window.clearInterval(timer);
        window.setTimeout(onComplete, 900);
      }
    }, 60);

    return () => window.clearInterval(timer);
  }, [onComplete]);

  return (
    <main className="cyber-welcome">
      <div className="cyber-grid" />
      <div className="cyber-scanline" />

      <header className="welcome-top">
        <span className="welcome-prompt">
          Aman.sec@portfolio:~$ <i />
        </span>
        <span className="welcome-nav">
          EXPLORE　 LEARN　 BUILD　 SECURE　 CONNECT
        </span>
      </header>

      <section className="welcome-console welcome-console-left">
        <h2>INITIALIZATION LOG</h2>
        {bootLines.slice(0, lineCount).map((line, index) => (
          <p key={line} className="boot-line">
            <span>[ OK ]</span> {line}
          </p>
        ))}
        <p className="terminal-cursor">root@portfolio:~$ <i /></p>
      </section>

      <section className="welcome-console welcome-console-right">
        <h2>
          <i className={online ? "status-dot online" : "status-dot"} />
          SYSTEM STATUS
        </h2>
        <p>Portfolio <b>{online ? "ONLINE" : "INITIALIZING"}</b></p>
        <p>Security <b>{progress >= 35 ? "ENABLED" : "CHECKING"}</b></p>
        <p>Encryption <b>{progress >= 60 ? "ACTIVE" : "PENDING"}</b></p>
        <p>Network <b>{progress >= 80 ? "CONNECTED" : "CONNECTING"}</b></p>
        <p>Threat monitor <b>{online ? "RUNNING" : "STARTING"}</b></p>
      </section>

      <section className="welcome-center">
        <div className="welcome-eyebrow">
          <span className="eyebrow-line" />
          WELCOME TO MY
          <span className="eyebrow-line" />
        </div>

        <h1 className="welcome-heading">
          <span>CYBERSECURITY</span>
          <strong>PORTFOLIO</strong>
        </h1>

        <p className="welcome-description">
          EXPLORE MY JOURNEY IN CYBERSECURITY, DIGITAL FORENSICS
          AND REAL-WORLD PROJECTS
        </p>

        <div className="welcome-progress">
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <strong className="progress-number">{progress}%</strong>
        </div>

        <p className="progress-message">
          {online ? "SYSTEM READY — WELCOME" : "Loading amazing content..."}
        </p>
      </section>

      <footer className="welcome-features">
        <div><b>⌕</b><span>PROJECTS<small>Real-world builds</small></span></div>
        <div><b>▤</b><span>SKILLS<small>Tools & technologies</small></span></div>
        <div><b>♜</b><span>ACHIEVEMENTS<small>Certifications & events</small></span></div>
        <div><b>♧</b><span>CONNECT<small>Let's build together</small></span></div>
      </footer>

      <p className="welcome-thanks">
        — SECURE · INVESTIGATE · BUILD · REPEAT —
      </p>

      <button className="skip-intro" onClick={onComplete}>
        SKIP INTRO ↗
      </button>
    </main>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return sessionStorage.getItem("amanPortfolioIntroSeen") !== "yes";
    } catch {
      return true;
    }
  });

  const finishWelcome = useCallback(() => {
    try {
      sessionStorage.setItem("amanPortfolioIntroSeen", "yes");
    } catch {
      // Session storage may be unavailable.
    }
    setShowWelcome(false);
  }, []);

  return (
    <>
      <PortfolioApp />
      {showWelcome && <WelcomeScreen onComplete={finishWelcome} />}
    </>
  );
}
