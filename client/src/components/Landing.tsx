import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "⚡",
    title: "Instant",
    desc: "No loading screens, no waiting rooms. You're connected in seconds.",
  },
  {
    icon: "👤",
    title: "Anonymous",
    desc: "Just a name. No account, no email, no sign-up required.",
  },
  {
    icon: "🌍",
    title: "Anyone, anywhere",
    desc: "Meet real people from around the world, one conversation at a time.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={s.root}>
      {/* Soft background blobs */}
      <div style={s.blobTopRight} />
      <div style={s.blobBottomLeft} />

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navDot} />
          <span style={s.navBrand}>We Hangout</span>
        </div>
        <button style={s.navCta} onClick={() => navigate("/join")}>
          Start a call
        </button>
      </nav>

      {/* Hero */}
      <main style={s.hero}>
        <div style={s.badge}>
          <span style={s.badgeDot} />
          <span style={s.badgeText}>Free forever · No sign-up</span>
        </div>

        <h1 style={s.headline}>
          Meet someone new,<br />
          <span style={s.headlineAccent}>right now.</span>
        </h1>

        <p style={s.sub}>
          Random video calls with real people. Open your camera,
          type your name, and you're in — no signup, no friction.
        </p>

        <div style={s.heroActions}>
          <button style={s.heroCta} onClick={() => navigate("/join")}>
            Start chatting
            <svg style={s.arrowIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span style={s.heroNote}>No account needed</span>
        </div>

        {/* Mock video card preview */}
        <div style={s.previewCard}>
          <div style={s.previewInner}>
            <div style={s.previewLeft}>
              <div style={s.previewAvatar}>
                <span style={s.previewAvatarIcon}>🧑</span>
              </div>
              <div style={s.previewConnected}>
                <div style={s.previewConnectedDot} />
                <span style={s.previewConnectedText}>Connected</span>
              </div>
            </div>
            <div style={s.previewDivider} />
            <div style={s.previewRight}>
              <div style={s.previewAvatar}>
                <span style={s.previewAvatarIcon}>👩</span>
              </div>
              <div style={s.previewConnected}>
                <div style={s.previewConnectedDot} />
                <span style={s.previewConnectedText}>Stranger</span>
              </div>
            </div>
          </div>
          <div style={s.previewBar}>
            <div style={s.previewBarBtn}>🎙</div>
            <div style={s.previewBarBtn}>📷</div>
            <div style={{ ...s.previewBarBtn, ...s.previewBarBtnEnd }}>✕</div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section style={s.features}>
        {features.map((f) => (
          <div key={f.title} style={s.featureCard}>
            <div style={s.featureIcon}>{f.icon}</div>
            <h3 style={s.featureTitle}>{f.title}</h3>
            <p style={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer CTA Strip */}
      <section style={s.strip}>
        <h2 style={s.stripHeadline}>Ready to meet someone?</h2>
        <button style={s.stripCta} onClick={() => navigate("/join")}>
          Open camera &amp; join
        </button>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerLogo}>
          <div style={s.navDot} />
          <span style={s.navBrand}>We Hangout</span>
        </div>
        <span style={s.footerNote}>
          Made for curious people. Built with React + Node.js by{" "}
          <a
            href="https://linkedin.com/in/aakarshbe"
            target="_blank"
            rel="noreferrer"
            style={s.footerLink}
          >
            Aakarsh
          </a>
        </span>
      </footer>
    </div>
  );
};

const ACCENT = "#c9633a";
const ACCENT_LIGHT = "rgba(201,99,58,0.12)";
const BG = "#fdf6ef";
const TEXT = "#2c1a0e";
const MUTED = "#a88878";

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: BG,
    color: TEXT,
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  blobTopRight: {
    position: "fixed",
    top: -180,
    right: -180,
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(201,99,58,0.13) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  blobBottomLeft: {
    position: "fixed",
    bottom: -200,
    left: -150,
    width: 450,
    height: 450,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(201,99,58,0.09) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  // Nav
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 40px",
    background: "rgba(253,246,239,0.85)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(180,100,60,0.08)",
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },
  navDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: ACCENT,
    boxShadow: `0 0 8px rgba(201,99,58,0.5)`,
    flexShrink: 0,
  },
  navBrand: {
    fontSize: 17,
    fontWeight: 600,
    color: TEXT,
    letterSpacing: "-0.2px",
  },
  navCta: {
    padding: "9px 20px",
    background: ACCENT,
    color: "#fff9f4",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.2s, transform 0.1s",
    letterSpacing: "0.1px",
  },

  // Hero
  hero: {
    position: "relative",
    zIndex: 1,
    maxWidth: 680,
    margin: "0 auto",
    padding: "90px 24px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 22,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "6px 14px",
    background: ACCENT_LIGHT,
    border: "1px solid rgba(201,99,58,0.2)",
    borderRadius: 100,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: ACCENT,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 500,
    color: ACCENT,
    letterSpacing: "0.3px",
  },
  headline: {
    fontSize: "clamp(38px, 7vw, 62px)",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    color: TEXT,
    margin: 0,
  },
  headlineAccent: {
    color: ACCENT,
  },
  sub: {
    fontSize: 17,
    lineHeight: 1.65,
    color: MUTED,
    maxWidth: 500,
    margin: 0,
  },
  heroActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  heroCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "15px 32px",
    background: ACCENT,
    color: "#fff9f4",
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0px",
    transition: "background 0.2s, transform 0.1s",
    boxShadow: "0 8px 24px rgba(201,99,58,0.3)",
  },
  arrowIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
  } as React.CSSProperties,
  heroNote: {
    fontSize: 12,
    color: MUTED,
  },

  // Preview card
  previewCard: {
    marginTop: 16,
    width: "100%",
    maxWidth: 440,
    background: "#fff9f4",
    border: "1px solid rgba(180,100,60,0.14)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 16px 48px rgba(100,50,20,0.12)",
  },
  previewInner: {
    display: "flex",
    gap: 0,
    padding: "32px 24px",
    alignItems: "center",
    justifyContent: "center",
  },
  previewLeft: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  previewRight: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  previewDivider: {
    width: 1,
    height: 80,
    background: "rgba(180,100,60,0.12)",
    margin: "0 20px",
  },
  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "#f5ede2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    border: "2px solid rgba(180,100,60,0.12)",
  },
  previewConnected: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  previewConnectedDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#4caf7d",
  },
  previewConnectedText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: 500,
  },
  previewBar: {
    borderTop: "1px solid rgba(180,100,60,0.1)",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fdf6ef",
  },
  previewBarBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#f5ede2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    border: "1px solid rgba(180,100,60,0.1)",
  },
  previewBarBtnEnd: {
    marginLeft: "auto",
    background: "rgba(201,99,58,0.1)",
    color: ACCENT,
    border: "1px solid rgba(201,99,58,0.15)",
  },

  // Features
  features: {
    position: "relative",
    zIndex: 1,
    maxWidth: 860,
    margin: "0 auto",
    padding: "0 24px 80px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
  },
  featureCard: {
    background: "#fff9f4",
    border: "1px solid rgba(180,100,60,0.1)",
    borderRadius: 18,
    padding: "28px 26px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  featureIcon: {
    fontSize: 26,
    lineHeight: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: TEXT,
    letterSpacing: "-0.2px",
  },
  featureDesc: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 1.6,
  },

  // Strip
  strip: {
    position: "relative",
    zIndex: 1,
    margin: "0 24px 60px",
    maxWidth: 860,
    marginLeft: "auto",
    marginRight: "auto",
    background: ACCENT,
    borderRadius: 22,
    padding: "48px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
    boxShadow: "0 12px 40px rgba(201,99,58,0.3)",
  },
  stripHeadline: {
    fontSize: "clamp(20px, 4vw, 28px)",
    fontWeight: 700,
    color: "#fff9f4",
    letterSpacing: "-0.5px",
  },
  stripCta: {
    padding: "13px 28px",
    background: "#fff9f4",
    color: ACCENT,
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.2s, transform 0.1s",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  // Footer
  footer: {
    position: "relative",
    zIndex: 1,
    borderTop: "1px solid rgba(180,100,60,0.1)",
    padding: "24px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },
  footerNote: {
    fontSize: 13,
    color: MUTED,
  },
  footerLink: {
    color: MUTED,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    fontWeight: 500,
    transition: "color 0.15s",
  },
};

export default Landing;
