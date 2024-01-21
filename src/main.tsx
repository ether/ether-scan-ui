import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createBrowserRouter, createRoutesFromElements, Navigate, Route} from "react-router-dom";
import {RouterProvider} from "react-router";
import {Statistics} from "@/pages/statistics.tsx";
import axios from "axios";

const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<App/>}>
        <Route index  element={<Navigate to="/statistics"/>}/>
        <Route  path="/statistics" element={<Statistics/>}/>
    </Route>
))


if (import.meta.env.PROD) {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
