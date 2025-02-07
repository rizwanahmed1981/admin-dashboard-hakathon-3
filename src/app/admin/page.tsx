'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    

    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (email === "" && password === "") {
            localStorage.setItem("isAdmin", "true"); // Store session data
            router.push("/admin/dashboard");
        } else {
            alert("Invalid email or password.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-semibold text-center mb-4">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
























// 'use client'
// import { useRouter } from "next/navigation";
// import { useState } from "react";


// export default function AdminLogin(){
//     const [email, setEmail] =useState("");
//     const [password, setPassword] = useState("");

//     const router = useRouter()

//     const handleLogin = (e: React.FormEvent)=>{
//         e.preventDefault()
//     }
//     if (email === "razykan.ra@gmail.com"){
//         router.push("/admin/dashboard")
//     }
// }