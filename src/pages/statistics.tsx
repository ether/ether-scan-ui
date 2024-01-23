import {Plugins} from "@/pages/plugins.tsx";
import {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {StatsResponse} from "@/types/StatsResponse.ts";
import {ApiVersions} from "@/pages/apiVersions.tsx";
import {InstancesByVersion} from "@/pages/instancesByVersion.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";

export const Statistics = ()=>{
    const [stats, setStats] = useState<StatsResponse>()

    useEffect(() => {
        axios.get("/stats")
            .then((res:AxiosResponse<StatsResponse>)=>{
                setStats(res.data)

            })
    }, [])

    if (!stats) return <LoadingSpinner/>

    return (
        <ScrollArea className="flex flex-col m-5 h-[99%]">
            <h1 className="text-4xl font-bold mb-5">Statistics</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Plugins stats={stats}/>
                    <ApiVersions stats={stats}/>
                    <div className="col-span-1 md:col-span-2">
                        <InstancesByVersion stats={stats}/>
                    </div>
                </div>
                <ScrollBar orientation="vertical"/>
        </ScrollArea>
    )
}
