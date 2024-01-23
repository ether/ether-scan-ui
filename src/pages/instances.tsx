import {useEffect, useMemo, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {Instance, InstancesResponse} from "@/types/InstancesResponse.ts";
import {AlertTriangle, Check, NotepadText} from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogPortal,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area"
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";


export const Instances = () => {
    const [instances, setInstances] = useState<InstancesResponse>()
    const [filter, setFilter] = useState<string>("")
    const filteredInstances = useMemo(() => {
        if (filter.length === 0) return instances?.instances
        return instances?.instances.filter((instance) => {
            return instance.name.includes(filter)
        })
    }, [instances, filter])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [instance, setInstance] = useState<Instance>()

    useEffect(() => {
        axios.get("/instances")
            .then((res: AxiosResponse<InstancesResponse>) => {
                setInstances(res.data)

            })
    }, [])

    const isOldVersion = (version: string) => {
        const replacedVersion = version.replaceAll(".", "")
        return replacedVersion < "190"
    }

    if (!filteredInstances) return <LoadingSpinner/>

    return (
        <div className="m-5"><h1 className="text-4xl font-bold mb-5">Scanned instances</h1>
            <div className="flex flex-row mb-5">
                <Input type="text" placeholder="Enter your Etherpad url"
                       className=" border border-gray-400 rounded-md px-2 py-1 focus:outline-none focus:border-blue-400"
                       onChange={(e) => {
                           setFilter(e.target.value);
                       }}/>
            </div>
            <ScrollArea className="md:m-5">
                <table className="w-full">
                    <thead>
                    <tr>
                        <td className="">Health</td>
                        <th className=" px-4 py-2">Name</th>
                        <th className=" px-4 py-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="">
                    {filteredInstances.map((instance) => {
                        return (
                            <tr key={instance.name}>
                                <td className="hidden md:block border px-4 py-2">{isOldVersion(instance.scan.version) ?
                                    <AlertTriangle className="text-yellow-400"/> : <Check/>}</td>
                                <td className="border px-4 py-2 cursor-pointer" onClick={() => {
                                    if (!instance.name.startsWith("http")) {
                                        instance.name = "http://" + instance.name;
                                    }
                                    window.open(instance.name);
                                }}>{instance.name}</td>
                                <td className="border px-4 py-2 text-etherpad" onClick={() => {
                                    setInstance(instance);
                                    setDialogOpen(true);
                                }}><NotepadText className="mx-[40%] cursor-pointer"/></td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                <ScrollBar orientation="vertical"/>
            </ScrollArea>
            <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(!dialogOpen)}>
                <DialogPortal>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Scan result from
                                the {new Date(instance?.scan.scan_time!).toLocaleString()}</DialogTitle>
                            <DialogDescription>Instance {instance?.name}</DialogDescription>
                        </DialogHeader>
                        {instance && <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-5">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Version</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{instance?.scan.version}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>API level</CardTitle>
                                        <CardContent>
                                            <p>{instance?.scan.api_version}</p>
                                        </CardContent>
                                    </CardHeader>
                                </Card>
                                <div className="col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Plugins</CardTitle>
                                        </CardHeader>
                                        <CardContent className="">
                                            <ul className="list-disc ml-5">{instance?.scan.plugins.map(p =>
                                                <li>{p}</li>)}</ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            {isOldVersion(instance?.scan.version!) &&
                                <span className="flex gap-5">
                                    <AlertTriangle className="text-yellow-400 w-16 h-16"/>
                                    <span className="text-red-700 font-bold mt-2">Your Etherpad version is really outdated. Consider upgrading to a newer version.</span>
                                </span>}
                        </div>}
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </div>

    )
}
