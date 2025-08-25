import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";



const Personal = () => { 
    const link = import.meta.env.VITE_LINK
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([])
    
    useEffect(() => {

        const func = async () => {
            try{
                axios.get(`${link}/personal/`, {headers: {Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`}}).then(
                    res => {
                        console.log('loading successful');
                        console.log(res);
                    }
                ).catch(async err => {
                    //err has the data, but response.data.message is what we're looking for bc we sent it through the backend.
                    console.log(err);
                    console.log(err.response.data)
                    if (err.response.data && err.response.data && err.response.data.message == 'token expired'){
                        console.log("refreshing the token")
                        await axios.get(`${link}/auth/refresh`, {withCredentials: true});
                        console.log("DONE")
                    }
                    console.log()
                })
                
                
                
                
                
                setData(tasks);
                console.log(tasks);
            }
            catch{
                return;
            }
            }
            func();
            

    }, [])
    

    return(
        <div>
            <h1> THIS IS PERSONAL! </h1>

            <h1> WILL HAVE TO implement getting everythign that belongs to a user.</h1>
            {/* <h1>{JSON.stringify(data)}</h1> */}

        </div>
    )
}


export default Personal;