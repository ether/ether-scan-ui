import {useEffect, useMemo, useState} from "react";
import axios, {AxiosError, AxiosResponse} from "axios";
import {Instance, InstancesResponse} from "@/types/InstancesResponse.ts";
import {AlertTriangle, Check, NotepadText, PlusIcon} from 'lucide-react'

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
import {Button} from "@/components/ui/button.tsx";
import {InstanceResponseError} from "@/types/InstanceResponseError.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export const Instances = () => {
    const [instances, setInstances] = useState<InstancesResponse>()
    const [filterableVersions, setFilterableVersions] = useState<string[]>()
    const [filter, setFilter] = useState<string>("")
    const [filteredVersion, setFilteredVersion] = useState<string>("")
    const filteredInstances = useMemo(() => {
        let filteredInstances = instances?.instances

        if (filter.length >0) {
            filteredInstances = instances?.instances.filter((instance) => {
                return instance.name.includes(filter)
            })
        }

        if (filteredVersion.length > 0 ) {
            filteredInstances = filteredInstances?.filter((instance) => {
                return instance.scan.version.startsWith(filteredVersion)
            })
        }

        return filteredInstances
    }, [instances, filter, filteredVersion])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [instance, setInstance] = useState<Instance>()
    const {toast} = useToast()

    useEffect(() => {
        axios.get("/instances")
            .then((res: AxiosResponse<InstancesResponse>) => {
                setInstances(res.data)
                const filterableVersions = new Set<string>()
                res.data.instances.forEach((instance) => {
                    filterableVersions.add(instance.scan.version.substring(0, instance.scan.version.lastIndexOf(".")))
                })
                setFilterableVersions(Array.from(filterableVersions))
            })
    }, [])

    const isOldVersion = (version: string) => {
        const replacedVersion = version.replaceAll(".", "")
        return replacedVersion < "200"
    }

    if (!filteredInstances) return <LoadingSpinner/>

    const dbFailures = (instance?.scan.db_reads_failed || 0) + (instance?.scan.db_writes_failed || 0)

    return (
        <div className="m-5 flex flex-col h-screen"><h1 className="text-4xl font-bold mb-5">Scanned instances</h1>
            <p>
                This is an overview of all scanned Etherpad instances. You can start a new scan by entering the URL of
                the instance and clicking on the <code className="border border-gray-400 bg-accent">Start scan</code> button.
                <br/>
                If you want to see the scan result of a specific instance, click on the notepad icon.
            </p>
            <div className="flex flex-row mb-5 gap-5">
                <Input type="text" placeholder="Enter your Etherpad url"
                       className=" border border-gray-400 rounded-md px-2 py-1 focus:outline-none focus:border-blue-400"
                       onChange={(e) => {
                           setFilter(e.target.value);
                       }}/>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <span className=" text-white">{filteredVersion? filteredVersion: '?'}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="">
                        {
                            filterableVersions?.map((version) => {
                                return (
                                    <DropdownMenuItem key={version} onClick={() => setFilteredVersion(version)}>
                                        {version}
                                    </DropdownMenuItem>
                                )
                            })
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <ScrollArea className="md:m-5 flex flex-col h-[70vh]">
                <table className="w-full break-all">
                    <thead>
                    <tr>
                        <td className="md:block hidden">Health</td>
                        <th className=" px-4 py-2">Name</th>
                        <th className=" px-4 py-2">Actions</th>
                    </tr>
                    </thead>
                    {filteredInstances.length > 0 ? <tbody className="">

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
                    </tbody> : <tbody>
                    <tr>
                        <td className="text-center" colSpan={3}>No instance found for the url. You can request a scan via the button below</td>
                    </tr>
                    </tbody>}
                </table>
                <div className="w-full flex items-center mt-5">
                    {filteredInstances.length == 0 && <Button className="mx-auto" onClick={() => {
                        toast({
                            className: 'bg-green-500',
                            title: 'Scan started',
                            description: 'The scan has started, it will take some time to complete'
                        })

                        axios.post('/scan', null, {
                            params: {
                                url: filter
                            }
                        })
                            .then((instance: AxiosResponse<Instance>) => {
                                const resultingInstances: InstancesResponse = {
                                    ...instances,
                                    instances: [...instances?.instances!, instance.data]
                                }
                                setInstances(resultingInstances)
                                setInstance(instance.data)
                                setDialogOpen(true)

                            })
                            .catch((e: AxiosError<InstanceResponseError>) => {
                                toast({
                                    className: 'bg-red-500',
                                    title: 'Error requesting scan',
                                    description: e.response?.data.error,
                                })
                            })
                    }}><PlusIcon/>Start scan</Button>
                    }
                </div>
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
                                            <CardTitle>Health</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc ml-5">
                                                { instance?.scan.websocket_available !== null && <li>Websocket supported: {instance?.scan.websocket_available ? <span>Yes</span> : <span className="text-red-700">No</span>}</li> }
                                                <li>DB failures: {dbFailures}</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Plugins</CardTitle>
                                        </CardHeader>
                                        <CardContent className="">
                                            <ul className="list-disc ml-5">{instance?.scan.plugins.map(p =>
                                                <li key={p}>{p}</li>)}</ul>
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
