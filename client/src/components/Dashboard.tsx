import { useEffect, useRef, useState } from "react"
import Room from "./Room";
import { config } from "../configs/config";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);

  console.log("BE url", config.BACKEND_URL);
  
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
    if(!videoRef.current) {
      return;
    }
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
  }

  useEffect(() => {
    if(videoRef && videoRef.current) {
      getCam();
    }
  }, [videoRef]);


  if(!joined) {  
      return (
        <div>
        <video ref={videoRef} autoPlay></video>
        <input type="text" placeholder="name" onChange={(e) => setName(e.target.value)} value={name} />
        <button onClick={() => setJoined(true)}>join</button>
      </div>
    )
  } 
  
  if(localAudioTrack && localVideoTrack) {
    return <Room localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} name={name} />
  }
}

export default Dashboard