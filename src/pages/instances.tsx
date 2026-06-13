import {useEffect, useMemo, useState} from "react";
import {Instance, InstancesResponse} from "@/types/InstancesResponse.ts";
import {AlertTriangle, Check, ExternalLink, Lock, NotepadText, PlusIcon} from 'lucide-react'
import {Link} from "react-router";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogPortal,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area"
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";
import {Button} from "@/components/ui/button.tsx";
import {InstanceResponseError} from "@/types/InstanceResponseError.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {ApiError, apiGet, apiPost} from "@/lib/api.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {getName, isOldVersion} from "@/lib/instance-utils.tsx";
import {InstanceDetails} from "@/components/instances/instance-details.tsx";


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
        const fetchInstances = async () => {
            const response = await apiGet<InstancesResponse>("/instances")
                setInstances(response)
                const filterableVersions = new Set<string>()
                response.instances.forEach((instance) => {
                    filterableVersions.add(instance.scan.version.substring(0, instance.scan.version.lastIndexOf(".")))
                })
                setFilterableVersions(
                    Array.from(filterableVersions).sort((a: string, b: string) =>
                        b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }),
                    ),
                )
        }

        void fetchInstances()
    }, [])

    if (!filteredInstances) return <LoadingSpinner/>

    return (
        <div className="flex flex-col h-screen"><h1 className="text-4xl font-bold mb-5">Scanned instances</h1>
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
                        <DropdownMenuItem key={"Reset"} onClick={() => setFilteredVersion("")}>
                            Reset
                        </DropdownMenuItem>
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
                        <th className="md:block hidden">Health</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                    </thead>
                    {filteredInstances.length > 0 ? <tbody className="">

                    {filteredInstances.map((instance) => {
                        return (
                            <tr key={instance.name}>
                                <td className="hidden md:block border px-4 py-2">
                                    <div className={"flex gap-2"}>
                                        {isOldVersion(instance.scan.version) ? <AlertTriangle className="text-yellow-400"/> : <Check/>}
                                        {instance.scan.is_public === false && <Lock className="text-red-700"/>}
                                    </div>
                                </td>
                                <td className="border px-4 py-2 cursor-pointer" onClick={() => {
                                    window.open(instance.name);
                                }}>{getName(instance)}</td>
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

                        apiPost<Instance>('/scan', {
                            params: {
                                url: filter
                            }
                        })
                            .then((instance) => {
                                const resultingInstances: InstancesResponse = {
                                    ...instances,
                                    instances: [...instances?.instances!, instance]
                                }
                                setInstances(resultingInstances)
                                setInstance(instance)
                                setDialogOpen(true)

                            })
                            .catch((e: ApiError<InstanceResponseError>) => {
                                toast({
                                    className: 'bg-red-500',
                                    title: 'Error requesting scan',
                                    description: e.data?.error ?? 'Unknown error',
                                })
                            })
                    }}><PlusIcon/>Start scan</Button>
                    }
                </div>
                <ScrollBar orientation="vertical"/>
            </ScrollArea>
            <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(!dialogOpen)}>
                <DialogPortal>
                    <DialogContent style={{maxHeight: "100%", overflowY: "auto"}}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <span>Scanned on: {new Date(instance?.scan.scan_time!).toLocaleString()}</span>
                                {instance && (
                                    <Link
                                        to={`/instances/${encodeURIComponent(instance.name.replace(/^https?:\/\//i, ""))}`}
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        title="Open dedicated instance page"
                                        aria-label="Open dedicated instance page"
                                    >
                                        <ExternalLink className="h-4 w-4"/>
                                    </Link>
                                )}
                            </DialogTitle>
                            <DialogDescription>Instance: {instance && getName(instance)}</DialogDescription>
                        </DialogHeader>
                        {instance && <InstanceDetails instance={instance}/>}
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </div>

    )
}
