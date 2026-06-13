import {useEffect, useState} from "react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {Instance, InstancesResponse} from "@/types/InstancesResponse.ts";
import {apiGet} from "@/lib/api.ts";
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";

export const Home = ()=>{
    const [instances, setInstances] = useState<Instance[]>()

    const hasFailures = (instance: Instance) : boolean => {
        return instance.scan.db_reads_failed > 0 || instance.scan.db_writes_failed > 0
    }

    useEffect(() => {
        apiGet<InstancesResponse>("/instances")
            .then((res) => {
                const topInstances : Instance[] = []
                res.instances.forEach((instance) => {
                    if (instance.scan.is_public && instance.scan.websocket_available && !hasFailures(instance) && instance.name.startsWith('https://') && instance.scan.version.replaceAll(".", "") > "27") {
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
            <h1 className="text-4xl font-bold mb-5">Welcome to Etherpad Scanner</h1>
            <p className="mb-3">
                <strong>Etherpad Scanner</strong> continuously crawls the internet for publicly reachable{" "}
                <a href="https://etherpad.org" className="underline hover:opacity-80" target="_blank" rel="noreferrer">Etherpad</a>{" "}
                instances, giving you a comprehensive overview of the global Etherpad ecosystem. It is powered by the open-source backend project{" "}
                <a href="https://github.com/gared/ether-scan" className="underline hover:opacity-80" target="_blank" rel="noreferrer">ether-scan</a>.
            </p>
            <p className="mb-3">
                Beyond discovery, this tool lets you instantly analyse <em>any</em> Etherpad instance — including your own. Enter a URL on the{" "}
                <strong>Scan</strong> page to quickly evaluate its configuration, plugin landscape, version status, and potential security concerns.
            </p>
            <p className="mb-2 font-medium">
                Looking for a public Etherpad instance to use right now? Here are some of the best-performing ones:
            </p>
            <div className="grid grid-cols-1 gap-5">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="px-4 py-2">Name</th>
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
                                    <td className="border px-4 py-2">{instance.scan.title}</td>
                                    <td className="border px-4 py-2 cursor-pointer" onClick={() => {
                                        window.open(instance.name);
                                    }}>{instance.name.replace(/^https?:\/\//i, "")}</td>
                                    <td className="border px-4 py-2">{instance.scan.plugins.join(', ')}</td>
                                </tr>
                            )
                        })}
                        </>
                     : <tr>
                            <td colSpan={2} className="text-center"><LoadingSpinner/></td>
                    </tr>}
                    </tbody>
                </table>
            </div>
            <ScrollBar orientation="vertical"/>
        </ScrollArea>
    )
}
