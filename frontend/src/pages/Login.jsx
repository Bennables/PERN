import { useState } from "react"
import { useActionState } from "react"
import axios from 'axios';
import "../main.css";
import { Link, useNavigate } from "react-router";
import { useEffect } from "react";



const Login = () =>{

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            if (username.trim() == "" || password.trim() == ""){
             console.log("INVALID VALUE. PLEASE TRY AGAIN")
            }
            else{
                const link = import.meta.env.VITE_LINK;

                const res = await axios.post(`${link}/login`, {username: username, password: password}, {withCredentials: true});
                // console.log(res.data);

                if (res.data.message  == 'correct'){
                    console.log(res.data)
                    sessionStorage.setItem("accessToken", res.data.token);
                    nav("/personal");
                }
            }
        }
        catch(e){
            console.log("There was an error" + e);
        }
    }

    useEffect(() =>{
        const loggedIn = () => { 
        const token = sessionStorage.getItem("accessToken");
        console.log("TOKEN IS " + token);
        if (token != null){
            console.log('naving to personal')
            nav("/personal");
        }
    }
    loggedIn();


    }, [])
        
    


    return(
        <div className=" " >
            <h1> LOGIN</h1>
            <form>
                <input value={username || ""} placeholder="username" name="user" onChange={(e) => setUsername(e.target.value)}></input>
                <input value={password || ""} placeholder="password" name="pass" onChange={(e) =>setPassword(e.target.value)}></input>
                <button className="text-2xl text-black h-full w-max bg-red-300" onClick={(e) => handleSubmit(e)}>SUBMIT</button>
            </form>
            <button className="text-2xl bg-blue"><Link to="/register">REGISTER</Link></button>
        </div>
    )
    
}

export default Login