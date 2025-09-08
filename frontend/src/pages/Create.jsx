import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

const Create = () => {
    const nav = useNavigate();
    const link = import.meta.env.VITE_LINK;
    const [name, setName] = useState("")
    const [scope, setScope] = useState("personal");


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



    return (
        <div>
            <input name="name" type="text" value= {name || "" } placeholder="choose a name" onChange={(e)=>setName(e.target.value)}></input>
            <label for="scope">Task Type:</label>
            <select id="scope" onChange={(e) => setScope(e.target.value)} name="scope">
            <option value="personal">Personal</option>
            <option value="team">Team</option>
            </select>
            <button onClick={(e) => handleSubmit(e)}>submit</button>
        </div>
    )
}

export default Create;