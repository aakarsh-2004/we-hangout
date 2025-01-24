import { useState } from "react"
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const joinRoom = () => {
    navigate(`/room?name=${name}`);
  }

  return (
    <div>
      <input type="text" placeholder="name" onChange={(e) => setName(e.target.value)} value={name} />
      <button onClick={joinRoom}>join</button>
    </div>
  )
}

export default Dashboard