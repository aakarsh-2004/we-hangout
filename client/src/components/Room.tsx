import { useEffect, useRef, useState } from "react";
import { config } from "../configs/config";

const Room = ({ localAudioTrack, localVideoTrack, name }: {
  localAudioTrack: MediaStreamTrack;
  localVideoTrack: MediaStreamTrack;
  name: string;
}) => {
  const [lobby, setLobby] = useState(true);
  const [connected, setConnected] = useState(false);

  // Use refs for mutable WebRTC/WS objects -- they are side-effect state, not render state
  const socketRef = useRef<WebSocket | null>(null);
  const sendingPcRef = useRef<RTCPeerConnection | null>(null);
  const receivingPcRef = useRef<RTCPeerConnection | null>(null);

  // Separate ICE candidate queues per connection to avoid cross-contamination
  const senderCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const receiverCandidateQueue = useRef<RTCIceCandidate[]>([]);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const createPeerConnection = () => {
    return new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });
  };

  const addTrackToRemoteVideo = (track: MediaStreamTrack) => {
    if (!remoteVideoRef.current) return;
    let stream = remoteVideoRef.current.srcObject;
    if (!(stream instanceof MediaStream)) {
      stream = new MediaStream();
      remoteVideoRef.current.srcObject = stream;
    }
    stream.addTrack(track);
  };

  useEffect(() => {
    const socket = new WebSocket(config.BACKEND_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "SET_NAME", name }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "SEND_OFFER") {
        setLobby(false);

        const pc = createPeerConnection();
        sendingPcRef.current = pc;

        // Wire up handlers BEFORE adding tracks to avoid missing early ICE candidates
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.send(JSON.stringify({
              type: "ADD_ICE_CANDIDATE",
              candidate: e.candidate,
              roomId: message.roomId,
              by: "sender",
            }));
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") setConnected(true);
          if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            setConnected(false);
          }
        };

        pc.ontrack = (e) => addTrackToRemoteVideo(e.track);

        if (localVideoTrack) pc.addTrack(localVideoTrack);
        if (localAudioTrack) pc.addTrack(localAudioTrack);

        pc.onnegotiationneeded = async () => {
          const sdp = await pc.createOffer();
          await pc.setLocalDescription(sdp);
          socket.send(JSON.stringify({
            type: "OFFER",
            sdp: pc.localDescription,
            roomId: message.roomId,
          }));
        };

      } else if (message.type === "OFFER") {
        setLobby(false);

        const pc = createPeerConnection();
        receivingPcRef.current = pc;

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.send(JSON.stringify({
              type: "ADD_ICE_CANDIDATE",
              candidate: e.candidate,
              by: "receiver",
              roomId: message.roomId,
            }));
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") setConnected(true);
          if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            setConnected(false);
          }
        };

        pc.ontrack = (e) => addTrackToRemoteVideo(e.track);

        if (localVideoTrack) pc.addTrack(localVideoTrack);
        if (localAudioTrack) pc.addTrack(localAudioTrack);

        await pc.setRemoteDescription(message.sdp);

        // Drain any candidates that arrived before the remote description was set
        for (const c of receiverCandidateQueue.current) {
          await pc.addIceCandidate(c);
        }
        receiverCandidateQueue.current = [];

        const sdp = await pc.createAnswer();
        await pc.setLocalDescription(sdp);

        socket.send(JSON.stringify({
          type: "ANSWER",
          sdp: pc.localDescription,
          roomId: message.roomId,
        }));

      } else if (message.type === "ANSWER") {
        const pc = sendingPcRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(message.sdp);

        // Drain candidates that arrived before the answer
        for (const c of senderCandidateQueue.current) {
          await pc.addIceCandidate(c);
        }
        senderCandidateQueue.current = [];

      } else if (message.type === "LOBBY") {
        setLobby(true);

      } else if (message.type === "ADD_ICE_CANDIDATE") {
        if (message.by === "sender") {
          // Candidate is from the sender side -- goes to the receivingPc
          const pc = receivingPcRef.current;
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(message.candidate);
          } else {
            receiverCandidateQueue.current.push(message.candidate);
          }
        } else {
          // Candidate is from the receiver side -- goes to the sendingPc
          const pc = sendingPcRef.current;
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(message.candidate);
          } else {
            senderCandidateQueue.current.push(message.candidate);
          }
        }

      } else if (message.type === "PEER_LEFT") {
        setConnected(false);
        setLobby(true);
        sendingPcRef.current?.close();
        receivingPcRef.current?.close();
        sendingPcRef.current = null;
        receivingPcRef.current = null;
        senderCandidateQueue.current = [];
        receiverCandidateQueue.current = [];
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      }
    };

    // Cleanup: close everything when component unmounts
    return () => {
      socket.close();
      sendingPcRef.current?.close();
      receivingPcRef.current?.close();
      sendingPcRef.current = null;
      receivingPcRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localVideoRef]);

  return (
    <div style={styles.root}>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          ...styles.remoteVideo,
          ...(connected && !lobby ? {} : styles.remoteVideoHidden),
        }}
      />

      {lobby && (
        <div style={styles.lobbyOverlay}>
          <div style={styles.lobbyCard}>
            <div style={styles.lobbyPulse} />
            <p style={styles.lobbyTitle}>Finding someone...</p>
            <p style={styles.lobbySubtitle}>You will be connected in a moment</p>
          </div>
        </div>
      )}

      {!lobby && !connected && (
        <div style={styles.lobbyOverlay}>
          <div style={styles.lobbyCard}>
            <p style={styles.lobbyTitle}>Connecting...</p>
          </div>
        </div>
      )}

      <div style={styles.localVideoWrapper}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={styles.localVideo}
        />
      </div>

      <div style={styles.nameBadge}>
        <div style={styles.nameDot} />
        <span style={styles.nameText}>{name}</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    background: "#fdf6ef",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  remoteVideo: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "opacity 0.4s ease",
  },
  remoteVideoHidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  lobbyOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    background: "radial-gradient(ellipse at center, #f5e0cc 0%, #fdf6ef 100%)",
  },
  lobbyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  lobbyPulse: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#c9633a",
    boxShadow: "0 0 0 0 rgba(201,99,58,0.5)",
    animation: "pulse 1.8s ease-in-out infinite",
    marginBottom: 6,
  },
  lobbyTitle: {
    fontSize: 22,
    fontWeight: 500,
    color: "#2c1a0e",
    letterSpacing: "-0.3px",
  },
  lobbySubtitle: {
    fontSize: 13,
    color: "#b09080",
    letterSpacing: "0.2px",
  },
  localVideoWrapper: {
    position: "absolute",
    bottom: 28,
    right: 28,
    width: 180,
    height: 135,
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid rgba(180,100,60,0.18)",
    boxShadow: "0 8px 32px rgba(100,50,20,0.18)",
    zIndex: 20,
    background: "#ecddd0",
  },
  localVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transform: "scaleX(-1)",
  },
  nameBadge: {
    position: "absolute",
    top: 24,
    left: 24,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(253,246,239,0.8)",
    border: "1px solid rgba(180,100,60,0.15)",
    backdropFilter: "blur(12px)",
    borderRadius: 100,
    padding: "7px 14px 7px 10px",
    zIndex: 20,
  },
  nameDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#c9633a",
    boxShadow: "0 0 6px rgba(201,99,58,0.55)",
  },
  nameText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#2c1a0e",
    letterSpacing: "0.1px",
  },
};

export default Room;
