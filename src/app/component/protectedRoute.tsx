'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function ProtectedRoute({children}: {children : React.ReactNode}){
    const router = useRouter()

    useEffect(()=>{
        const isLogedin = localStorage.getItem("isLogedin")
        if(!isLogedin){
            router.push("/admin")
        }
    },[router])
    return <>
    {children}
    </>

}