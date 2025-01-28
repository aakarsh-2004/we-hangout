import { useEffect, useRef, useState } from "react";
import { config } from "../configs/config";

const Room = ({ localAudioTrack, localVideoTrack, name }: {
  localAudioTrack: MediaStreamTrack,
  localVideoTrack: MediaStreamTrack,
  name: string
}) => {
  const [_socket, setSocket] = useState<WebSocket | null>(null);
  const [lobby, setLobby] = useState(false);
  const [_sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
  const [_receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
  const [_remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [_remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [_remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
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
  

  useEffect(() => {
    const socket = new WebSocket(config.BACKEND_URL);
    setSocket(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "SET_NAME",
          name: name,
        })
      );
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "SEND_OFFER") {
        setLobby(false);
        // alert("send offer please");

        const pc = createPeerConnection();
        setSendingPc(pc);
        const stream = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        setRemoteMediaStream(stream);

        pc.ontrack = (event) => {
          console.log("Track received: ", event.track);

          if (remoteVideoRef.current) {
            let stream = remoteVideoRef.current.srcObject;

            if (!(stream instanceof MediaStream)) {
              stream = new MediaStream();
              remoteVideoRef.current.srcObject = stream;
            }

            stream.addTrack(event.track);

            if (event.track.kind === "video") {
              console.log("Remote video track added.");
              setRemoteVideoTrack(event.track);
            } else if (event.track.kind === "audio") {
              console.log("Remote audio track added.");
              setRemoteAudioTrack(event.track);
            }
          }
        };

        if (localVideoTrack) {
          console.error("added track");
          console.log("localvideotrack", localVideoTrack);
          pc.addTrack(localVideoTrack);
        }
        if (localAudioTrack) {
          console.error("added track");
          console.log("localaudiotrack", localAudioTrack);
          pc.addTrack(localAudioTrack);
        }



        pc.onicecandidate = async (e) => {
          console.log("receiving ice candidate locally");
          if (e.candidate) {
            socket.send(JSON.stringify({
              type: "ADD_ICE_CANDIDATE",
              candidate: e.candidate,
              roomId: message.roomId,
              by: "sender"
            }))
          }
        }

        pc.onnegotiationneeded = async () => {
          console.log("on negotiation neeeded, sending offer");
          const sdp = await pc.createOffer();
          pc.setLocalDescription(sdp);
          socket.send(
            JSON.stringify({
              type: "OFFER",
              sdp: sdp,
              roomId: message.roomId,
            })
          );
        }

      } else if (message.type == "OFFER") {
        setLobby(false);
        // alert("send answer please");
        console.log("received offer");

        const pc = createPeerConnection();
        setReceivingPc(pc);
        const stream = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        setRemoteMediaStream(stream);

        pc.ontrack = (event) => {
          console.log("Track received: ", event.track);

          if (remoteVideoRef.current) {
            let stream = remoteVideoRef.current.srcObject;

            // Ensure the srcObject is initialized as a MediaStream
            if (!(stream instanceof MediaStream)) {
              stream = new MediaStream();
              remoteVideoRef.current.srcObject = stream;
            }

            // Add the incoming track to the MediaStream
            stream.addTrack(event.track);

            if (event.track.kind === "video") {
              console.log("Remote video track added.");
              setRemoteVideoTrack(event.track);
            } else if (event.track.kind === "audio") {
              console.log("Remote audio track added.");
              setRemoteAudioTrack(event.track);
            }
          }
        };


        await pc.setRemoteDescription(message.sdp);
        const sdp = await pc.createAnswer();

        pc.setLocalDescription(sdp);

        pc.onicecandidate = async (e) => {
          console.log("on ice candidate on receiving side");
          if (e.candidate) {
            socket.send(JSON.stringify({
              type: "ADD_ICE_CANDIDATE",
              candidate: e.candidate,
              by: "receiver",
              roomId: message.roomId
            }));
          }
        }

        socket.send(
          JSON.stringify({
            type: "ANSWER",
            sdp: sdp,
            roomId: message.roomId,
          })
        );

      } else if (message.type == "ANSWER") {
        setLobby(false);

        const handleAnswer = async (pc: RTCPeerConnection) => {
          try {
            await pc.setRemoteDescription(message.sdp);
            console.log("Remote description set successfully for sender");
          } catch (err) {
            console.error("Error setting remote description:", err);
          }
        };

        setSendingPc(pc => {
          if (pc) {
            handleAnswer(pc);
          }
          return pc;
        });
      } else if (message.type == "LOBBY") {
        setLobby(true);
      } else if (message.type == "ADD_ICE_CANDIDATE") {
        console.log("add ice candidate from remote");
        if (message.by == "sender") {
          setReceivingPc(pc => {
            pc?.addIceCandidate(message.candidate);
            return pc;
          })
        } else {
          setSendingPc(pc => {
            pc?.addIceCandidate(message.candidate);
            return pc;
          })
        }
      } else {
        console.log("Action not specified", message);
      }
    };
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      // localVideoRef.current.play();
    }
  }, [localVideoRef])

  return (
    <div>
      Hi {name}
      <video width={400} height={400} ref={localVideoRef} autoPlay playsInline></video>
      {lobby ? "waiting to connect you to someone" : ""}
      <video width={400} height={400} ref={remoteVideoRef} autoPlay playsInline></video>
    </div>
  );
};

export default Room;
