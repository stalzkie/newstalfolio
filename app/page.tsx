import "./desktop.css";

import { DesktopRoot } from "@/components/desktop-root";
import { getSiteContent } from "@/lib/site-service";
import { home } from "@/lib/desktop/render";

/* Content is read per request so /admin edits show up without a redeploy. */
export const revalidate = 0;

export default async function HomePage() {
  const content = await getSiteContent();
  const cfg = content.config;

  return (
    <>
      {/* Applies a remembered theme before first paint, so a visitor who
          chose dark never sees a flash of light. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('stal-theme');" +
            "if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);" +
            "else if(t==='auto')document.documentElement.removeAttribute('data-theme');}catch(e){}",
        }}
      />

      <header className="menubar">
        <nav aria-label="Pages">
          <a className="brand" href="#home">
            stal
          </a>
          <a href="#about" data-nav="about">
            about
          </a>
          <a href="#systems" data-nav="systems">
            full-stack
          </a>
          <a href="#ai" data-nav="ai">
            ai engineering
          </a>
          <a href="#ventures" data-nav="ventures">
            ventures
          </a>
          <a href="#writing" data-nav="writing">
            writing
          </a>
          <a href="#work" data-nav="work">
            work with me
          </a>
        </nav>
        <a className="glyph" href="#home" aria-label="Home">
          ~/stal
        </a>
        <div className="right">
          <button className="search-btn" id="searchBtn" aria-label="Search the site">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" />
            </svg>
            <kbd id="kbdHint">⌘K</kbd>
          </button>
          <button
            className="theme-btn"
            id="themeBtn"
            aria-label="Switch theme"
            title="Theme: light (press T)"
          >
            <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
            </svg>
          </button>
          <span className="clock" id="clock" title="Bacolod City time">
            --:-- --
          </span>
          <a className="cta" href="#work">
            hire me ↗
          </a>
        </div>
      </header>

      {/* The landing page is server-rendered; the client runtime takes over
          from here and renders every other hash route. */}
      <main
        id="app"
        className="wrap"
        tabIndex={-1}
        dangerouslySetInnerHTML={{ __html: home(content) }}
      />

      <footer>
        <div className="wrap">
          <div className="foot-cols">
            <div>
              <h5>work</h5>
              <a href="#systems">full-stack systems</a>
              <a href="#ai">ai engineering</a>
              <a href="#ventures">ventures</a>
            </div>
            <div>
              <h5>me</h5>
              <a href="#about">about</a>
              <a href="#experience">experience</a>
              <a href="#awards">awards &amp; features</a>
              <a href="#writing">writing</a>
            </div>
            <div>
              <h5>elsewhere</h5>
              <a href={cfg.githubUrl} target="_blank" rel="noopener">
                github
              </a>
              <a href="https://euclid-hq.vercel.app/" target="_blank" rel="noopener">
                euclid
              </a>
              <a href="#contact">contact</a>
            </div>
            <div>
              <h5>based in</h5>
              <p>{cfg.footerBlurb}</p>
            </div>
          </div>
          <div className="foldword" id="foldword" aria-label="stal" role="img" />
          <p className="foldcap">
            stalingrad dollosa · software engineer · mobile developer · ai engineer · founder
          </p>
        </div>
      </footer>

      <div className="dock-wrap">
        <nav className="dock" id="dock" aria-label="Dock" />
      </div>

      <div className="spot" id="spot" hidden role="dialog" aria-modal="true" aria-label="Search">
        <div className="spot-box">
          <div className="spot-in">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" />
            </svg>
            <input id="spotInput" placeholder="Search projects, pages, skills…" aria-label="Search" autoComplete="off" />
          </div>
          <div className="spot-list" id="spotList" role="listbox" />
          <div className="spot-foot">
            <span>↑↓ to move · enter to open</span>
            <span>esc to close</span>
          </div>
        </div>
      </div>

      <div id="toastHost" />

      <DesktopRoot content={content} initialRoute="home" />
    </>
  );
}
