import { useState } from 'react';
import { createRoom, joinRoom } from '../api/room';
import Logo from '../Components/Logo';
import Theme from '../Components/Theme';
import { UserGroupIcon, KeyIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';

export default function Roomoptions() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  
  const handleCreateBtn = async()=>{
    try {
      const response = await createRoom();
      console.log(response.data);
      navigate("/room/chat", {state: response.data});
    } catch (error) {
      console.log(error);
    }
    
  }

  const handleSubmit = async(e)=>{
    e.preventDefault();
    try {
      await joinRoom(roomId);
      navigate("/room/chat", {state: {roomId}});
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center">
      <div className="bg-txt dark:bg-brand-light max-w-md w-full p-8 rounded-xl shadow-md">
        
        <div className="flex justify-between items-center mb-6">
          <Logo />
          <Theme />
        </div>

        <h1 className="text-2xl font-semibold mb-2">Create or Join a Room</h1>
        <p className="text-sm text-gray-600">Start a new chat room or enter a code to join an existing one.</p>

        <div className="mt-8">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand/70 transition cursor-pointer" onClick={handleCreateBtn}>
            <UserGroupIcon className="w-5" />
            Create Room
          </button>
        </div>

        <div className="flex items-center gap-2 my-6">
          <span className="flex-grow h-px bg-gray-600/80 dark:bg-txt/80"></span>
          <span className="text-xs text-gray-600 dark:text-txt/60">OR</span>
          <span className="flex-grow h-px bg-gray-600/80 dark:bg-txt/80"></span>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 border border-gray-600/80 dark:border-txt/80 rounded-lg p-2">
            <KeyIcon className="w-5 text-gray-500" />
            <input type="text" value={roomId} onChange={e=> setRoomId(e.target.value)} placeholder="Enter 6-digit code" className="w-full outline-none text-center" pattern='\d{6}' maxLength={6} onInput={(e)=> e.target.value = e.target.value.replace(/\D/g, "")}/>
          </div>
          <button type="submit" className="flex items-center gap-2 justify-center w-full py-3 bg-brand-light dark:bg-txt text-txt dark:text-gray-800 rounded-lg font-semibold hover:bg-brand-light/90 dark:hover:bg-txt/90 transition cursor-pointer">
            <ArrowRightEndOnRectangleIcon className='w-5'/>
            Join Room
          </button>
        </form>

        <div className="flex gap-2 text-xs justify-center mt-8 text-txt/80">
          <a href="#">Privacy Policy</a>
          <span>•</span>
          <a href="#">Terms and Conditions</a>
        </div>
      </div>
    </div>
    </>
  )
}