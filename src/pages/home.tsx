import {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {Instance, InstancesResponse} from "@/types/InstancesResponse.ts";

export const Home = ()=>{
    const [instances, setInstances] = useState<Instance[]>()

    const hasFailures = (instance: Instance) : boolean => {
        return instance.scan.db_reads_failed > 0 || instance.scan.db_writes_failed > 0
    }

    useEffect(() => {
        axios.get("/instances")
            .then((res: AxiosResponse<InstancesResponse>) => {
                const topInstances : Instance[] = []
                res.data.instances.forEach((instance) => {
                    if (instance.scan.is_public && instance.scan.websocket_available && !hasFailures(instance) && instance.name.startsWith('https://') && instance.scan.version.replaceAll(".", "") > "22") {
                        topInstances.push(instance)
                    }
                })
                topInstances.sort((a, b) => {
                    if (a.scan.mean_connects === null || b.scan.mean_connects === null) {
                        return 0
                    }

                    return a.scan.mean_connects < b.scan.mean_connects ? 1 : -1
                })
                setInstances(Array.from(topInstances))
            })
    }, [])

    return (
        <ScrollArea className="flex flex-col m-5 h-[99%]">
            <h1 className="text-4xl font-bold mb-5">Welcome to Etherpad scanner</h1>
            <p>The etherpad scanner scans the internet for running etherpad instances to get an overview of the etherpad eco system (based on the github project <a href="https://github.com/gared/ether-scan">ether-scan</a>.</p>
            <p>This tool also allows you to get instant insights into your Etherpad instance. It is designed to quickly assess the configuration, health and security of your Etherpad setup.</p>
            <br/>
            <p>If you are looking for a public instance which you can quickly use you can find here a list of some public instances:</p>
            <div className="grid grid-cols-1 gap-5">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="px-4 py-2">URL</th>
                        <th className="px-4 py-2">Plugins</th>
                    </tr>
                    </thead>
                    <tbody>
                    {instances && instances.length > 0 ?
                        <>
                        {instances.map((instance) => {
                            return (
                                <tr key={instance.name}>
                                    <td className="border px-4 py-2 cursor-pointer" onClick={() => {
                                        window.open(instance.name);
                                    }}>{instance.name}</td>
                                    <td className="border px-4 py-2">{instance.scan.plugins.join(', ')}</td>
                                </tr>
                            )
                        })}
                        </>
                     : <tr><td colSpan={2} className="text-center">Loading...</td></tr>}
                    </tbody>
                </table>
            </div>
            <ScrollBar orientation="vertical"/>
        </ScrollArea>
    )
}
