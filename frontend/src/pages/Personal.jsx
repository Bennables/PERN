import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";



const Personal = () => { 
    const link = import.meta.env.VITE_LINK
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([])
    
    useEffect(() => {
        const func = async () => {
            const tasks = await axios.get(`${link}/`);
            setData(tasks);
            console.log(tasks);
        }

        func();

    }, [])
    

    return(
        <div>
            <h1> THIS IS PERSONAL! </h1>

            <h1> WILL HAVE TO implement getting everythign that belongs to a user.</h1>
            <h1>dsdf</h1>

        </div>
    )
}


export default Personal;