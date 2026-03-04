import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import Room from "./Room";
import { config } from "../configs/config";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
};

const Dashboard = () => {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  console.log("BE url", config.BACKEND_URL);

  const videoRef = useRef<HTMLVideoElement>(null);

  const getCam = async () => {
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      if (!videoRef.current) return;
      videoRef.current.srcObject = new MediaStream([videoTrack]);
      videoRef.current.play();
      setCamReady(true);
    } catch {
      setCamError(true);
    }
  };

  useEffect(() => {
    if (videoRef && videoRef.current) getCam();
  }, [videoRef]);

  if (!joined) {
    const s = makeStyles(isMobile);
    return (
      <div style={s.root}>

        {/* Camera preview panel */}
        <div style={s.left}>
          <div style={s.leftInner}>
            <div style={s.camFrame}>
              <video ref={videoRef} autoPlay muted style={s.camVideo} />
              {!camReady && (
                <div style={s.camOverlay}>
                  {camError ? (
                    <>
                      <span style={s.camOverlayIcon}>X</span>
                      <span style={s.camOverlayText}>Camera unavailable</span>
                    </>
                  ) : (
                    <>
                      <div style={s.camSpinner} />
                      <span style={s.camOverlayText}>Starting camera...</span>
                    </>
                  )}
                </div>
              )}
              {camReady && (
                <div style={s.liveBadge}>
                  <div style={s.liveDot} />
                  <span style={s.liveText}>Live preview</span>
                </div>
              )}
            </div>

            {!isMobile && (
              <div style={s.leftCopy}>
                <p style={s.leftTitle}>You look great!</p>
                <p style={s.leftSub}>Once you join, you will be matched with someone instantly.</p>
              </div>
            )}
          </div>
        </div>

        {/* Join form panel */}
        <div style={s.right}>
          <div style={s.rightInner}>
            <button style={s.backBtn} onClick={() => navigate("/")}>
              Back
            </button>

            <div style={s.formHeader}>
              <div style={s.formLogoRow}>
                <div style={s.formLogoDot} />
                <span style={s.formLogoText}>We Hangout</span>
              </div>
              <h2 style={s.formTitle}>Almost there</h2>
              <p style={s.formSub}>Tell us what to call you and hit join.</p>
            </div>

            <div style={s.form}>
              <label style={s.label}>Your name</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setJoined(true)}
                style={s.input}
              />
              <button
                onClick={() => setJoined(true)}
                disabled={!name.trim()}
                style={{ ...s.joinBtn, ...(!name.trim() ? s.joinBtnDisabled : {}) }}
              >
                {name.trim() ? `Join as ${name}` : "Enter your name to join"}
              </button>
            </div>

            <div style={s.tips}>
              {["Anonymous by default", "No account required", "Instant connection"].map((t) => (
                <div key={t} style={s.tip}>
                  <span style={s.tipDot}>+</span>
                  <span style={s.tipText}>{t}</span>
                </div>
              ))}
            </div>

            <p style={s.privacy}>By joining you agree to be respectful. That is it.</p>
          </div>
        </div>
      </div>
    );
  }

  if (localAudioTrack && localVideoTrack) {
    return <Room localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} name={name} />;
  }
};

const ACCENT = "#c9633a";
const TEXT = "#2c1a0e";
const MUTED = "#a88878";

const makeStyles = (isMobile: boolean): Record<string, React.CSSProperties> => ({
  root: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    height: isMobile ? "auto" : "100vh",
    minHeight: "100vh",
    width: "100vw",
    overflowY: isMobile ? "auto" : "hidden",
    background: "#fdf6ef",
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Camera panel
  left: {
    flex: isMobile ? "none" : "0 0 55%",
    background: "#f5ede2",
    display: "flex",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: "center",
    padding: isMobile ? "20px 20px 0" : "40px",
    borderRight: isMobile ? "none" : "1px solid rgba(180,100,60,0.1)",
    borderBottom: isMobile ? "1px solid rgba(180,100,60,0.1)" : "none",
  },
  leftInner: {
    width: "100%",
    maxWidth: isMobile ? "100%" : 480,
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 0 : 24,
  },
  camFrame: {
    position: "relative",
    width: "100%",
    aspectRatio: isMobile ? "16/9" : "4/3",
    borderRadius: isMobile ? 16 : 20,
    overflow: "hidden",
    background: "#ecddd0",
    border: "1px solid rgba(180,100,60,0.15)",
    boxShadow: isMobile ? "none" : "0 12px 40px rgba(100,50,20,0.12)",
  },
  camVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transform: "scaleX(-1)",
  },
  camOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "#ecddd0",
  },
  camOverlayIcon: {
    fontSize: 28,
    opacity: 0.4,
  },
  camOverlayText: {
    fontSize: 13,
    color: MUTED,
    letterSpacing: "0.1px",
  },
  camSpinner: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "2.5px solid rgba(201,99,58,0.2)",
    borderTopColor: ACCENT,
    animation: "spin 0.8s linear infinite",
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(253,246,239,0.82)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(180,100,60,0.15)",
    borderRadius: 100,
    padding: "5px 11px 5px 8px",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#4caf7d",
    boxShadow: "0 0 5px rgba(76,175,125,0.6)",
  },
  liveText: {
    fontSize: 11,
    fontWeight: 500,
    color: TEXT,
    letterSpacing: "0.2px",
  },
  leftCopy: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingLeft: 4,
  },
  leftTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: TEXT,
    letterSpacing: "-0.2px",
  },
  leftSub: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 1.55,
  },

  // Form panel
  right: {
    flex: 1,
    display: "flex",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: "center",
    padding: isMobile ? "24px 20px 40px" : "40px",
    overflowY: isMobile ? "visible" : "auto",
  },
  rightInner: {
    width: "100%",
    maxWidth: isMobile ? "100%" : 360,
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 22 : 28,
  },
  backBtn: {
    alignSelf: "flex-start",
    background: "none",
    border: "none",
    color: MUTED,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "0",
    transition: "color 0.15s",
  },
  formHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  formLogoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  formLogoDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: ACCENT,
    boxShadow: "0 0 7px rgba(201,99,58,0.45)",
  },
  formLogoText: {
    fontSize: 13,
    fontWeight: 600,
    color: ACCENT,
    letterSpacing: "0.1px",
  },
  formTitle: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: 700,
    color: TEXT,
    letterSpacing: "-0.5px",
    margin: 0,
  },
  formSub: {
    fontSize: 14,
    color: MUTED,
    margin: 0,
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: TEXT,
    letterSpacing: "0.4px",
    textTransform: "uppercase" as const,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    background: "#fff9f4",
    border: "1.5px solid rgba(180,100,60,0.2)",
    borderRadius: 12,
    color: TEXT,
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  },
  joinBtn: {
    width: "100%",
    padding: "15px 16px",
    background: ACCENT,
    border: "none",
    borderRadius: 12,
    color: "#fff9f4",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s, transform 0.1s",
    fontFamily: "inherit",
    letterSpacing: "-0.1px",
    boxShadow: "0 6px 20px rgba(201,99,58,0.25)",
    marginTop: 4,
  },
  joinBtnDisabled: {
    background: "rgba(201,99,58,0.13)",
    color: "#c4a090",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  tips: {
    display: "flex",
    flexDirection: isMobile ? "row" : "column",
    flexWrap: isMobile ? "wrap" : "nowrap",
    gap: isMobile ? 8 : 10,
    padding: isMobile ? "14px 16px" : "20px",
    background: "rgba(201,99,58,0.06)",
    borderRadius: 14,
    border: "1px solid rgba(201,99,58,0.1)",
  },
  tip: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 6 : 10,
    flex: isMobile ? "0 0 auto" : "unset",
  },
  tipDot: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: 700,
    flexShrink: 0,
  },
  tipText: {
    fontSize: isMobile ? 12 : 13,
    color: TEXT,
    fontWeight: 500,
    whiteSpace: isMobile ? "nowrap" : "normal",
  },
  privacy: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center" as const,
    lineHeight: 1.5,
  },
});

export default Dashboard;
