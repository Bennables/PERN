import { useState } from "react"
import { useActionState } from "react"
import axios from 'axios';
import "../main.css";
import { useNavigate } from "react-router";

const Register = () =>{

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();


        if(username.trim() == "" || password.trim() ==""){
            console.log("One of these is empty");
        }
        else{
            const link = import.meta.env.VITE_LINK;
            const reply = await axios.post(`${link}/register`, {username: username, password: password})
            console.log()
            if(reply.data == "created"){
                nav("/login")
            }

        }

       
        
    }



    return(
        <div className="" >
            <h1> register</h1>
            <form>
                <input value={username || ""} placeholder="username" name="user" onChange={(e) => setUsername(e.target.value)}></input>
                <input value={password || ""} placeholder="password" name="pass" onChange={(e) =>setPassword(e.target.value)}></input>
                <button className="text-2xl text-black h-full w-max bg-red-300" onClick={(e) => handleSubmit(e)}>SUBMIT</button>
            </form>
        </div>
    )
}

export default Register