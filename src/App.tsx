import './App.css'
import Header from "@/components/layout/header.tsx";
import {Outlet} from "react-router";
import Sidebar from "@/components/layout/sidebar.tsx";

const App = ()=>{
    return (
        <>
            <Header />
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="w-full pt-16 overflow-auto">
                    {<Outlet/>}
                </main>
            </div>
        </>
    );
}

export default App
