import { useNavigate } from "react-router-dom"

export default function NotFound(){
    const navigate = useNavigate();
    return(
        <div className="bg-brand-dark w-screen h-screen flex flex-col items-center gap-2 justify-center text-txt">
            <div className="text-2xl ">404 Page Not Found.</div>
            <button className="bg-brand rounded p-2" onClick={()=> navigate("/")}>Return</button>
        </div>
    )
}