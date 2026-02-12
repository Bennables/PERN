import axios from "axios";
import dotenv from 'dotenv';
import { Navigate, useNavigate } from "react-router";




const Logout = () =>
{

    const link = import.meta.env.VITE_LINK
    const nav = useNavigate()
    const logoutClicked = () => {
        //send a request to the backend to log out.
        //have to clear redis and redirect to login page
        

        const res = axios.post(`${link}/logout`, {'token': sessionStorage.getItem("accessToken")}, {'withCredentials' : true}).catch(
            (e)=>{
                console.error("Logout error:", e?.response?.data?.message || e.message);
            }
        )
        sessionStorage.clear();
        nav("/login");
    }
    
    return (
        <button onClick={logoutClicked}> LOG OUT </button>
    )
}

export default Logout;