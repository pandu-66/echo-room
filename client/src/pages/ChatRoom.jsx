import { ArrowRightStartOnRectangleIcon, ClipboardDocumentIcon, UserIcon, UserCircleIcon, InformationCircleIcon, Bars3CenterLeftIcon } from "@heroicons/react/24/solid";
import Logo from "../Components/Logo";
import Theme from "../Components/Theme";
import useWebSocket from "../hooks/useWebSocket";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { leaveOrEndRoom } from "../api/room";
// import colorPick from "./utils/help";

export default function ChatRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const roomId = location.state?.roomId?.toString()||"";
  const {messages, sendMessage, participants, sendTyping, typingUser, notification} = useWebSocket(`${import.meta.env.VITE_WS_URL}/?token=${sessionStorage.getItem("token")}&roomId=${roomId}`);
  const [inputMsg, setInputMsg] = useState("");
  const participantList = useMemo(
    () => Array.from(participants.values()), 
    [participants]
  );
  const bottomRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isYou = (id)=>{
    let userId;
    try{
      const sessionData = JSON.parse(sessionStorage.getItem("user"));
      userId = sessionData.id;
    }catch{
      return false;
    }

    return id===userId;
  }
  const timetoString = (ts)=>{
    const date = new Date(ts);
    return date.toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"});
  }

  const typingTimeout = useRef(null);
  const handleInputChange = (e)=>{
    setInputMsg(e.target.value);
    sendTyping(true);

    if(typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(()=> sendTyping(false), 2000);
  }

  const handleSubmit = (e)=>{
    e.preventDefault();
    if(inputMsg){
      sendMessage(inputMsg);
      setInputMsg("");
    }
  }

  const handleQuit = async()=>{
    try {
      const response = await leaveOrEndRoom(roomId);
      console.log(response.data);
      navigate("/room");
    } catch (error) {
      console.log(error);
    }
  }
  

  useEffect(()=>{
    if(!roomId) navigate("/room");
  }, []);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyToClipBoard = ()=>{
    navigator.clipboard.writeText(roomId)
      .then(()=>{
      console.log("copied");
      })
      .catch((err)=>{
      console.log(err);
      })
  }

  return (
    <div className="w-screen h-screen flex bg-white dark:bg-brand-dark text-brand-dark dark:text-txt">

      {notification&&(
        <div className="fixed top-2 right-2 bg-brand-light/90 dark:bg-txt/90 text-txt dark:text-brand-light rounded italic text-sm p-2 flex items-center justify-evenly gap-1">
          <InformationCircleIcon className="w-4 h-4"/>
          {notification}
        </div>
      )}

      <div className="md:hidden fixed top-4 left-4 p-2 cursor-pointer" onClick={()=>setSidebarOpen(true)}>
        <Bars3CenterLeftIcon className="w-6 h-6"/>
      </div>

      <aside className={`fixed top-0 left-0 z-40 transform transition-transform duration-300 w-64 bg-txt dark:bg-brand-light h-full flex flex-col p-6 ${sidebarOpen?'translate-x-0':'-translate-x-full'} md:static md:translate-x-0`}>
        <div className='mb-2 flex justify-between'>
            <Logo/>
            <Theme/>
        </div>
        <h2 className="text-xl font-semibold my-6">Room</h2>

        <div className="flex items-center justify-between p-4 border border-brand-dark/20 dark:border-txt/20 rounded-sm">
            <span>{roomId.split("").join(" ")}</span>
            <ClipboardDocumentIcon className="w-5 cursor-pointer" onClick={copyToClipBoard}/>
        </div>
        
        <div className="mt-6 border-t border-brand-dark/20 dark:border-txt/20 pt-4 flex-1">
          <h3 className="text-sm font-semibold mb-2">Participants</h3>
          <ul className="space-y-2 text-sm">
            {
                participantList.map((data)=>(
                    <li key={data.id} className="flex items-center justify-between" style={{"--user-col": `${data.color}`}}>
                        <div className="flex items-center gap-2">
                            <UserCircleIcon className="w-4 text-[var(--user-col)]"/> 
                            {data.name} 
                            {isYou(data.id)&&<span className="text-[12px] text-brand-dark/50 dark:text-txt/50">(You)</span>}
                          </div>
                        <span className={`w-2 h-2 rounded-full ${(data.isVisible)?"bg-green-500":"bg-danger"} block`}></span>
                    </li>
                ))
            }
          </ul>
        </div>

        <button className="flex items-center justify-center gap-2 mt-auto px-3 py-2 bg-danger text-txt cursor-pointer rounded-lg text-sm hover:opacity-90" onClick={handleQuit}>
          <ArrowRightStartOnRectangleIcon className="w-5"/>
          Leave Room
        </button>
        <div className='flex flex-col items-center gap-2 text-xs justify-center mt-8 text-brand-dark/70 dark:text-txt/70'>
            <a>Privacy Policy</a>
            <a>Terms and conditions</a>
          </div>
      </aside>

      {sidebarOpen&&(
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={()=> setSidebarOpen(false)}/>
      )}

      <main className="flex-1 flex flex-col mt-5">
        
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          
          {messages.map((message, idx)=>
            isYou(message.from.id)?
            (<div className="flex flex-col items-end gap-1" key={idx} style={{"--send-col": `${message.from.color}`}}>
              <span className="text-xs opacity-70 flex items-center gap-1 text-[var(--send-col)]">
                  <UserIcon className="w-4"/>
                  You
                  <span className="text-[10px] text-brand-dark/50 dark:text-txt/50">{timetoString(message.ts)}</span>
              </span>
              <div className="bg-brand px-4 py-2 rounded-lg w-max max-w-sm text-txt">
                {message.text}
              </div>
            </div>)
            :
            (<div className="flex flex-col gap-1" key={idx} style={{"--send-col": `${message.from.color}`}}>
              <span className="text-xs opacity-70 flex items-center gap-1 text-[var(--send-col)]">
                  <UserIcon className="w-4"/>
                  {message.from.name}
                  <span className="text-[10px] text-brand-dark/50 dark:text-txt/50">{timetoString(message.ts)}</span>
              </span>
              <div className="bg-brand-light/80 dark:bg-brand-light px-4 py-2 rounded-lg w-max max-w-sm text-txt">
                {message.text}
              </div>
            </div>)
          )}

          <div ref={bottomRef}></div>

        </div>

        {typingUser && (
          <div className="text-sm text-brand-dark/70 dark:text-txt/70 italic px-2">
            {typingUser} is typing...
          </div>
        )}
        <form className="p-4 flex gap-3 border-t border-brand-light/20 dark:border-txt/20" onSubmit={handleSubmit}>
          <input value={inputMsg} onChange={handleInputChange} type="text" placeholder="Type your message..." className="flex-1 p-3 rounded-lg text-brand-light dark:text-txt outline-0" />
          <button type="submit" className="px-4 py-2 bg-brand rounded-lg font-medium text-txt">Send</button>
        </form>
      </main>
    </div>
  );
}
