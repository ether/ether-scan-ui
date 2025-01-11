import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createHashRouter, createRoutesFromElements, Route} from "react-router-dom";
import {RouterProvider} from "react-router";
import {Statistics} from "@/pages/statistics.tsx";
import axios from "axios";
import {Instances} from "@/pages/instances.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {Home} from "@/pages/home.tsx";

const router = createHashRouter(createRoutesFromElements(
    <Route element={<App/>}>
        <Route index element={<Home/>}/>
        <Route  path="/statistics" element={<Statistics/>}/>
        <Route path={"/instances"} element={<Instances/>}/>
    </Route>
))



axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <Toaster />
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
