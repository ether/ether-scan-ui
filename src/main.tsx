import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createBrowserRouter, createRoutesFromElements, Route} from "react-router";
import {RouterProvider} from "react-router";
import {Statistics} from "@/pages/statistics.tsx";
import {Instances} from "@/pages/instances.tsx";
import {InstanceDetail} from "@/pages/instance.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {Home} from "@/pages/home.tsx";

const router = createBrowserRouter(createRoutesFromElements(
    <Route element={<App/>}>
        <Route index element={<Home/>}/>
        <Route  path="/statistics" element={<Statistics/>}/>
        <Route path={"/instances"} element={<Instances/>}/>
        <Route path={"/instances/:name"} element={<InstanceDetail/>}/>
    </Route>
), { basename: import.meta.env.BASE_URL })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <Toaster />
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
