import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Item from "../components/Dragger";
import Logout from "../components/logout";




const Personal = () => { 
    const nav = useNavigate();
    const link = import.meta.env.VITE_LINK
    const [hasOrg, setHasOrg] = useState(false);

    useEffect(() => {
        const checkOrg = async () => {
            try {
                const a = await axios.get(`${link}/team`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` },
                    withCredentials: true
                });
                console.log(a)
                setHasOrg(true);
            } catch (err) {
                const msg = err?.response?.data?.message;
                //! NEW ERROR, if not logged inm will not save
                console.error("Personal org check error:", msg || err.message);
                if (err?.response?.status === 400 && msg === "User is not part of any organization") {
                    setHasOrg(false);
                } else if (err?.response?.status === 401 || msg === "token expired") {
                    sessionStorage.removeItem("accessToken");
                    nav("/login");
                }
            }
        };

        checkOrg();
    }, [link, nav])

    
    return(
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Your tasks</h1>
                        <p className="text-sm text-slate-600">
                            Personal + Organization (if you have one)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Logout/>
                    </div>
                </div>
            </div>

            {!hasOrg && (
                <div className="max-w-3xl mx-auto mt-6 px-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <h2 className="text-amber-800 font-semibold mb-1">No organization tasks yet</h2>
                        <p className="text-amber-700 text-sm">
                            Create an organization (or select one on the org screen) to see org tasks here.
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-10">
                {/* Personal tasks */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Personal</h2>
                        <button
                            className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                            onClick={() => nav("/create")}
                        >
                            Add task
                        </button>
                    </div>
                    <Item dest={"tasks"} compact />
                </section>

            
            </div>
        </div>
    )
}


export default Personal;