import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";


const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', "Dec"]
const mapMonth = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr' : 4, 'May':5, 'Jun':6, 'Jul':7, 'Aug':8, 'Sep':9, 'Oct':10, 'Nov':11, "Dec":12}
const thrityOneDays = [1, 3, 5, 7, 8, 10, 12] 
const thirtyDays = [4, 6, 9, 11]

const Create = () => {
    const nav = useNavigate();
    const link = import.meta.env.VITE_LINK;
    const [name, setName] = useState("")
    const [scope, setScope] = useState("personal");
    const [month, setMonth] = useState(0);
    const [day , setDay] = useState(1); //0-12 month
    const [year, setYear] = useState(2025);
    const [totalDays, setTotalDays] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            alert("Please enter a task name");
            return;
        }

        let data = {name: name, scope: scope == 'personal' ? "personal": "team"};

        try {
            const response = await axios.post(`${link}/create`, data, {
                headers: {Authorization: `Bearer ${sessionStorage.accessToken}`}, 
                withCredentials: true
            });
            
            console.log("Task created successfully:", response.data);
            alert("Task created successfully!");
            setName(""); // Clear the form
            nav("/personal"); // Navigate back to personal page
            
        } catch (error) {
            console.error("Error creating task:", error);
            if (error.response) {
                alert(`Error: ${error.response.data.message || 'Failed to create task'}`);
            } else {
                alert("Network error. Please try again.");
            }
        }
    }

    const countMonths = () =>{
        let days = 0;
        if ( thrityOneDays.includes(month)){
            days = 31
        }
        else if (thirtyDays.includes(month)){
            days = 30
        }
        else{
            const isLeap = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0))
            if (isLeap){
                days = 29
            }
            else{
                days = 28
            }
        }
        const options = []
        for(let i = 1; i <= days; i++){
            options.push(<option value={i}>{i}</option>)
        }
        return options
    }

    const countYears = () => {
        const options = []
        const yearNum = new Date().getFullYear();
        for(let i = yearNum; i < yearNum + 10; i++){
            options.push(<option value={i}>{i}</option>)
        }
        return options;
    }



    return (
        <div>
            <input name="name" type="text" value= {name || "" } placeholder="choose a name" onChange={(e)=>setName(e.target.value)}></input>
            <label for="scope">Task Type:</label>
            <select id="scope" onChange={(e) => setScope(e.target.value)} name="scope">
                <option value="personal">Personal</option>
                <option value="team">Team</option>
            </select>

            <select id="month" onChange={(e) => setMonth(mapMonth[e.target.value])} name="month">
                {monthList.map((month)=>(
                    <option value={month}>{month}</option>
                ))}
            </select>

            <select id="day" name="day" onChange={(e) => setDay(e.target.value)}>
                {countMonths()}
            </select>


            <select id="year" name="year" onChange={(e) => setYear(e.target.value)}>
                {countYears()}
            </select>

            <button onClick={(e) => handleSubmit(e)}>submit</button>
        </div>
    )
}

export default Create;