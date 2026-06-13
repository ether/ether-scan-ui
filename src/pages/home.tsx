import {useEffect, useState} from "react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {Instance, InstancesResponse} from "@/types/InstancesResponse.ts";
import {apiGet} from "@/lib/api.ts";
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

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
            {instances && instances.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {instances.map((instance) => {
                        const displayUrl = instance.name.replace(/^https?:\/\//i, "").replace(/\/$/, "");
                        const title = (instance.scan as any).title || displayUrl;
                        return (
                            <Card key={instance.name} className="flex flex-col hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-base leading-tight">{title}</CardTitle>
                                        <span className="shrink-0 text-xs font-mono bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                                            v{instance.scan.version}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{displayUrl}</p>
                                </CardHeader>
                                <CardContent className="flex-1 pb-3">
                                    {instance.scan.plugins.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {instance.scan.plugins.slice(0, 8).map((plugin) => (
                                                <span
                                                    key={plugin}
                                                    className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5"
                                                >
                                                    {plugin}
                                                </span>
                                            ))}
                                            {instance.scan.plugins.length > 8 && (
                                                <span className="text-xs text-muted-foreground rounded-full px-2 py-0.5 border">
                                                    +{instance.scan.plugins.length - 8} more
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No plugins installed</p>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => window.open(instance.name, "_blank")}
                                    >
                                        Open Instance ↗
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex justify-center py-12">
                    <LoadingSpinner/>
                </div>
            )}
            <ScrollBar orientation="vertical"/>
        </ScrollArea>
    )
}
