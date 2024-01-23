import './App.css'
import Header from "@/components/layout/header.tsx";
import {Outlet} from "react-router";
import Sidebar from "@/components/layout/sidebar.tsx";
import {useEffect} from "react";
import {initTheme} from "@/components/layout/ThemeToggle/theme-toggle.tsx";

const App = ()=>{

    useEffect(() => {
        initTheme()
    }, []);

    return (
        <>
            <Header />
            <div className="flex h-screen">
                <Sidebar />
                <main className="mt-20 w-full">
                    {<Outlet/>}
                </main>
            </div>
        </>
    );
}

export default App
