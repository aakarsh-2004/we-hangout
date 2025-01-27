import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Room = ({ localAudioTrack, localVideoTrack, name }: {
  localAudioTrack: MediaStreamTrack,
  localVideoTrack: MediaStreamTrack,
  name: string
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lobby, setLobby] = useState(false);
  const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
  const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>();
  const localVideoRef = useRef<HTMLVideoElement>();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
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
        alert("send offer please");

        const pc = new RTCPeerConnection();
        setSendingPc(pc);

        if (localVideoTrack) {
          console.error("added track");
          console.log(localVideoTrack);
          pc.addTrack(localVideoTrack);
        }
        if (localAudioTrack) {
          console.error("added track");
          console.log(localAudioTrack);
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
        alert("send answer please");
        console.log("received offer");

        const pc = new RTCPeerConnection();
        setReceivingPc(pc);

        pc.setRemoteDescription(message.sdp);
        const sdp = await pc.createAnswer();

        const stream = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        setRemoteMediaStream(stream);

        pc.setLocalDescription(sdp);

        pc.ontrack = ({ track, type }) => {
          alert("on track");
          // if (type == 'audio') {
          //   setRemoteAudioTrack(track);
          //   if (remoteVideoRef.current) {
          //     remoteVideoRef.current.srcObject.addTrack(track)
          //   }
          // } else {
          //   setRemoteVideoTrack(track);
          //   if (remoteVideoRef.current) {
          //     remoteVideoRef.current.srcObject.addTrack(track)
          //   }
          // }
          // remoteVideoRef.current?.play();
        }

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

        setTimeout(() => {
          const track1 = pc.getTransceivers()[0].receiver.track
          const track2 = pc.getTransceivers()[1].receiver.track
          console.log(track1);
          if (track1.kind === "video") {
            setRemoteAudioTrack(track2)
            setRemoteVideoTrack(track1)
          } else {
            setRemoteAudioTrack(track1)
            setRemoteVideoTrack(track2)
          }

          if(remoteVideoRef.current && remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject.addTrack(track1)
            remoteVideoRef.current.srcObject.addTrack(track2)
            remoteVideoRef.current.play();
          }
        }, 5000)
      } else if (message.type == "ANSWER") {
        setLobby(false);
        alert("Connection done");

        setSendingPc(pc => {
          pc?.setRemoteDescription(message.sdp);
          return pc;
        })
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
      localVideoRef.current.play();
    }
  }, [localVideoRef])

  return (
    <div>
      Hi {name}
      <video width={400} height={400} ref={localVideoRef} autoPlay></video>
      {lobby ? "waiting to connect you to someone" : ""}
      <video width={400} height={400} ref={remoteVideoRef} autoPlay></video>
    </div>
  );
};

export default Room;
