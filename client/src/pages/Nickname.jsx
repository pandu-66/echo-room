import Logo from '../Components/Logo';
import Theme from '../Components/Theme';
import { UserIcon } from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { postName } from '../api/room';

export default function Nickname(){
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const handleSubmit = async(e)=>{
        e.preventDefault();
        const response = await postName(name);
        console.log(response.data.token);
        sessionStorage.setItem("token", response.data.token);
        navigate("/room");
    }

    return(
        <div className="w-screen h-screen flex justify-center items-center">
        <div className="bg-txt dark:bg-brand-light p-8 rounded-xl max-w-md w-full">
          <div className='mb-2 flex justify-between'>
            <Logo/>
            <Theme/>
          </div>

          <div className='flex items-center gap-4 mt-8'>
            <UserIcon className='w-6'/>
            <h1 className='text-2xl font-semibold'>Enter a name</h1>
          </div>

          <p className='text-sm mt-3 text-brand-dark/70 dark:text-txt/70'>Enter a name you would like to go by.</p>
          
          <form onSubmit={handleSubmit}>
            <input type="text" value={name} onChange={(e)=> setName(e.target.value)} placeholder='Type here' className='bg-brand-dark/70 dark:bg-txt outline-none text-txt dark:text-gray-700 py-3 mt-8 font-semibold text-center rounded-lg w-full' required/>
            {/* <span className='flex gap-4 justify-end'></span> */}
            <button className='w-1/3 px-4 py-2 bg-brand text-white font-semibold rounded-lg mt-6 hover:bg-brand/70 transition cursor-pointer'>Submit</button>
          </form>

          <div className='flex gap-2 text-xs justify-center mt-8 text-brand-dark/70 dark:text-txt/70'>
            <a href="#">Privacy Policy</a>
            <span>•</span>
            <a href="#">Terms and conditions</a>
          </div>
        </div>
      </div>
    )
}