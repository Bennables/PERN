import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import "./Create.css";

const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', "Dec"]
const mapMonth = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr' : 4, 'May':5, 'Jun':6, 'Jul':7, 'Aug':8, 'Sep':9, 'Oct':10, 'Nov':11, "Dec":12}
const thrityOneDays = [1, 3, 5, 7, 8, 10, 12] 
const thirtyDays = [4, 6, 9, 11]

const Create = () => {
    const nav = useNavigate();
    const link = import.meta.env.VITE_LINK;
    const [name, setName] = useState("")
    const [scope, setScope] = useState("personal");
    const [month, setMonth] = useState(1);
    const [day , setDay] = useState(1); //0-12 month
    const [year, setYear] = useState(2025);
    const [urgency, setUrgency] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            alert("Please enter a task name");
            return;
        }

        const orgId = sessionStorage.getItem("orgId");
        if (scope === "team" && (!orgId || orgId === "null" || orgId === "undefined")) {
            alert("No organization selected. Please pick your org first.");
            nav("/org/find");
            return;
        }

        let data = {
            name: name,
            scope: scope,
            deadline: `${year}-${month}-${day}`,
            urgency: urgency,
            org_id: scope === "team" ? Number(orgId) : undefined
        };

        try {
            const token = sessionStorage.getItem("accessToken");

            const makeRequest = () => axios.post(`${link}/create`, data, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            let response;
            try {
                response = await makeRequest();
            } catch (err) {
                const message = err?.response?.data?.message;
                console.log("error message is: " + (message || "(no message)"));

                if (message === "token expired") {
                    // refresh and retry once
                    const refreshRes = await axios.get(`${link}/auth/refresh`, { withCredentials: true });
                    sessionStorage.setItem("accessToken", refreshRes.data.token);

                    const retryToken = sessionStorage.getItem("accessToken");
                    response = await axios.post(`${link}/create`, data, {
                        headers: { Authorization: `Bearer ${retryToken}` },
                        withCredentials: true
                    });
                } else if (message === "bad token" || message === "token doesn't exist") {
                    sessionStorage.removeItem("accessToken");
                    nav("/login");
                    return;
                } else {
                    throw err;
                }
            }
            
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
            options.push(<option key={i} value={i}>{i}</option>)
        }
        return options
    }

    const countYears = () => {
        const options = []
        const yearNum = new Date().getFullYear();
        for(let i = yearNum; i < yearNum + 10; i++){
            options.push(<option key={i} value={i}>{i}</option>)
        }
        return options;
    }



    return (
        <div className="create-container">
            <div className="create-card">
                <h1>Create New Task</h1>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group form-group-full">
                        <label htmlFor="name">Task Name</label>
                        <input 
                            id="name"
                            name="name" 
                            type="text" 
                            value={name || ""} 
                            placeholder="Enter task name..." 
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group form-group-full">
                        <label>Task Type</label>
                        <div className="scope-group">
                            <div className="scope-option">
                                <input 
                                    id="personal"
                                    type="radio" 
                                    name="scope" 
                                    value="personal"
                                    checked={scope === "personal"}
                                    onChange={(e) => setScope(e.target.value)}
                                />
                                <label htmlFor="personal">Personal</label>
                            </div>
                            <div className="scope-option">
                                <input 
                                    id="team"
                                    type="radio" 
                                    name="scope" 
                                    value="team"
                                    checked={scope === "team"}
                                    onChange={(e) => setScope(e.target.value)}
                                />
                                <label htmlFor="team">Team</label>
                            </div>
                        </div>
                    </div>

                    <div className="date-section">
                        <label>Deadline</label>
                        <div className="form-row-three">
                            <div className="form-group">
                                <label htmlFor="month">Month</label>
                                <select id="month" onChange={(e) => setMonth(mapMonth[e.target.value])} name="month">
                                    {monthList.map((month)=>(
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="day">Day</label>
                                <select id="day" name="day" onChange={(e) => setDay(e.target.value)}>
                                    {countMonths()}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="year">Year</label>
                                <select id="year" name="year" onChange={(e) => setYear(e.target.value)}>
                                    {countYears()}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group form-group-full">
                        <label htmlFor="urgency">Priority Level</label>
                        <select id="urgency" name="urgency" onChange={(e) => setUrgency(e.target.value)}>
                            <option value="3">🔥 Super High</option>
                            <option value="2">📌 Medium</option>
                            <option value="1">✓ Low</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-button">Create Task</button>
                </form>
            </div>
        </div>
    )
}

export default Create;