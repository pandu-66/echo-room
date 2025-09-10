import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

export default function Theme(){
    const [theme, setTheme] = useState(localStorage.getItem("theme")||"dark");

    useEffect(()=>{
        if(theme==="dark"){
            document.documentElement.classList.add("dark");
        }else{
            document.documentElement.classList.remove("dark");
        }
    },[theme]);


    const changeTheme = (param)=>{
        if(param===theme) return;

        setTheme(param);
        localStorage.setItem("theme", param);
    }

    return(
        <div className='flex bg-gray-500 dark:bg-txt/20 p-1 w-18 h-9 items-center rounded justify-between'> 
            <button className={`${theme==="light"&&'bg-gray-400'} p-1 rounded cursor-pointer`} onClick={()=> changeTheme("light")}><SunIcon className='w-5 h-5'/></button>
            <button className={`${theme==="dark"&&'bg-brand-dark/50'} p-1 rounded cursor-pointer`} onClick={()=> changeTheme("dark")}><MoonIcon className='w-5 h-5'/></button>
        </div>
    )
}