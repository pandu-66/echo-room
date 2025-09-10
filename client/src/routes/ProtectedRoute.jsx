import { useState, useEffect } from "react";
import { verify } from "../api/room";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({children}){
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();
    useEffect(()=>{
        verify().then(()=>{
            setIsAuth(true);
        })
        .catch(()=>{
            navigate("/");
        })
    }, [navigate]);

    return isAuth? children: null;
}