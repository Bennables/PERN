import { useState } from "react"
import { useActionState } from "react"
import axios from 'axios';
import "../main.css";
import { Link, useNavigate } from "react-router";
import { useEffect } from "react";

const Login = () => {
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-sm text-gray-600 mt-2">Please sign in to your account</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    id="username"
                                    name="user"
                                    type="text"
                                    value={username || ""}
                                    placeholder="Enter your username"
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="pass"
                                    type="password"
                                    value={password || ""}
                                    placeholder="Enter your password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg"
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        © 2024 Your App. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login