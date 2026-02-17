import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";

const TaskView = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const link = import.meta.env.VITE_LINK;
    
    const [task, setTask] = useState(null);
    const [subtasks, setSubtasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newSubtask, setNewSubtask] = useState("");
    const [editingSubtask, setEditingSubtask] = useState(null);
    const [editDescription, setEditDescription] = useState("");

    const urgencyLabels = {
        1: { label: "Low", color: "bg-blue-100 text-blue-800" },
        2: { label: "High", color: "bg-orange-100 text-orange-800" },
        3: { label: "Any Time", color: "bg-gray-100 text-gray-800" },
        4: { label: "Done", color: "bg-green-100 text-green-800" }
    };

    const handleApiError = async (err, context = 'request') => {
        console.error(`Error ${context}:`, err?.response?.data?.message || err.message);
        
        if (!err.response) {
            setError("Connection failed. Check your internet connection.");
            return;
        }
        
        const status = err.response.status;
        
        if (status === 401 || err.response?.data?.message === 'token expired') {
            try {
                const res = await axios.get(`${link}/auth/refresh`, { withCredentials: true });
                sessionStorage.setItem("accessToken", res.data.token);
                window.location.reload();
            } catch (refreshErr) {
                console.error("Refresh token failed");
                sessionStorage.removeItem('accessToken');
                nav('/login');
            }
        } else if (status === 403 || status === 404) {
            setError("Task not found or access denied");
        } else {
            setError("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const token = sessionStorage.getItem("accessToken");
                
                // Fetch task directly by ID
                const taskRes = await axios.get(`${link}/tasks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });

                const taskData = taskRes.data.task;
                setTask(taskData);

                // Fetch subtasks
                const subtasksRes = await axios.get(`${link}/tasks/${id}/subtasks`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                
                setSubtasks(subtasksRes.data.subtasks || []);
                setLoading(false);
            } catch (err) {
                console.log(err)
                handleApiError(err, 'fetching task');
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [id, link, nav]);

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        try {
            const token = sessionStorage.getItem("accessToken");
            const res = await axios.post(
                `${link}/subtasks`,
                { task_id: id, description: newSubtask },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );

            setSubtasks([...subtasks, res.data.subtask]);
            setNewSubtask("");
        } catch (err) {
            handleApiError(err, 'creating subtask');
        }
    };

    const handleUpdateSubtask = async (subtaskId) => {
        try {
            const token = sessionStorage.getItem("accessToken");
            const res = await axios.put(
                `${link}/subtasks/${subtaskId}`,
                { description: editDescription },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );

            setSubtasks(subtasks.map(st => 
                st.ID === subtaskId ? res.data.subtask : st
            ));
            setEditingSubtask(null);
            setEditDescription("");
        } catch (err) {
            handleApiError(err, 'updating subtask');
        }
    };

    const handleDeleteSubtask = async (subtaskId) => {
        if (!confirm("Delete this subtask?")) return;

        try {
            const token = sessionStorage.getItem("accessToken");
            await axios.delete(`${link}/subtasks/${subtaskId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            setSubtasks(subtasks.filter(st => st.ID !== subtaskId));
        } catch (err) {
            handleApiError(err, 'deleting subtask');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-600">Loading task...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link to="/personal" className="text-indigo-600 hover:text-indigo-700">
                        ← Back to tasks
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Left half - Task details */}
            <div className="w-1/2 fixed left-0 top-0 h-screen overflow-y-auto bg-white border-r border-slate-200">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link 
                            to="/personal" 
                            className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
                        >
                            ← Back to tasks
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            {task.task_name}
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${urgencyLabels[task.urgency]?.color || 'bg-gray-100 text-gray-800'}`}>
                                {urgencyLabels[task.urgency]?.label || 'Unknown'}
                            </span>
                            {task.deadline && (
                                <span className="text-sm text-slate-600">
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">Description</h2>
                            <p className="text-slate-700 whitespace-pre-wrap">{task.description}</p>
                        </div>
                    )}

                    {/* Subtasks section */}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Subtasks</h2>
                        
                        {/* Add subtask form */}
                        <form onSubmit={handleAddSubtask} className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    placeholder="Add a subtask..."
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    Add
                                </button>
                            </div>
                        </form>

                        {/* Subtasks list */}
                        <div className="space-y-2">
                            {subtasks.length === 0 ? (
                                <p className="text-slate-500 text-sm">No subtasks yet</p>
                            ) : (
                                subtasks.map((subtask) => (
                                    <div 
                                        key={subtask.ID} 
                                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                        {editingSubtask === subtask.ID ? (
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    className="flex-1 px-2 py-1 border border-slate-300 rounded"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleUpdateSubtask(subtask.ID)}
                                                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingSubtask(null);
                                                        setEditDescription("");
                                                    }}
                                                    className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm hover:bg-slate-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1">
                                                    <p className="text-slate-700">
                                                        {subtask.description || '(No description)'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingSubtask(subtask.ID);
                                                            setEditDescription(subtask.description || "");
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSubtask(subtask.ID)}
                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right half - empty for now, can be used for additional info */}
            <div className="w-1/2 fixed right-0 top-0 h-screen overflow-y-auto bg-slate-50">
                <div className="p-8">
                    <div className="text-slate-500 text-center mt-20">
                        <p>Additional information can go here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskView;
