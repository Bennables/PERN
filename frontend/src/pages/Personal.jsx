import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";



const Personal = () => { 
    const link = import.meta.env.VITE_LINK
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([])

    const nav = useNavigate();
    
    useEffect(() => {

        const func = async () => {
            try{
                //get data
                axios.get(`${link}/personal/`, {headers: {Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`}}).then(
                    res => {
                        console.log('loading successful');
                        console.log(res);
                    }
                ).catch(async err => {
                    console.log('error message is: ' + err.response.data.message)
                    if (err.response && err.response.data && err.response.data.message == 'token expired'){
                        //get here
                        console.log("refreshing the token")
                        await axios.get(`${link}/auth/refresh`, {withCredentials: true})
                            .then(res =>{
                                console.log(res);   
                                console.log("WE're getting here successfully" ) 
                                sessionStorage.setItem("accessToken", res.data.token)   
                            })
                            .catch(err => { 
                                console.log(err);
                                if (err.response && err.response.data && err.response.data.message == "token doesn't exist"){
                                    sessionStorage.removeItem('accessToken')
                                    nav(`/login`);
                                }
                            })
                        console.log("DONE")
                    }

                    if (err.response && err.response.data && err.response.data.message == 'bad token'){
                        sessionStorage.removeItem('accessToken')
                        nav(`/login`);
                    }
                })
                setData(tasks);
                console.log(tasks);
            }
            catch{ 
                
            }
            }
            func();
            

    }, [])
    

    const logout = () => {
        console.log("clear clicked")
        axios.get(`${link}/clear`, {headers: {Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`}}, {withCredentials: true})
    }


    
    return(
        <div>
            <h1> THIS IS PERSONAL! </h1>

            <h1> WILL HAVE TO implement getting everythign that belongs to a user.</h1>
            {/* <h1>{JSON.stringify(data)}</h1> */}


            <button onClick={() =>logout()} className="border-2 bg-red-50"> dkljfsoldjflkdsfjl</button>

        </div>
    )
}


export default Personal;