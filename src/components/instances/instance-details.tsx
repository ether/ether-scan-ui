import {AlertTriangle, Lock} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Instance} from "@/types/InstancesResponse.ts";
import {getDbFailures, isOldVersion, renderPluginInfo} from "@/lib/instance-utils.tsx";

type InstanceDetailsProps = {
    instance: Instance;
}

export const InstanceDetails = ({instance}: InstanceDetailsProps) => {
    const dbFailures = getDbFailures(instance);

    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card>
                    <CardHeader>
                        <CardTitle>Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{instance.scan.version}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>API level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{instance.scan.api_version}</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc ml-5">
                            {instance.scan.websocket_available !== null && (
                                <li>
                                    Websocket supported: {instance.scan.websocket_available ? <span>Yes</span> : <span className="text-red-700">No</span>}
                                </li>
                            )}
                            <li>DB failures: {dbFailures}</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Plugins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc ml-5">
                            {instance.scan.plugin_data.map((plugin) => (
                                <li key={plugin.name}>{renderPluginInfo(plugin)}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {isOldVersion(instance.scan.version) && (
                <span className="flex gap-5">
                    <AlertTriangle className="text-yellow-400 w-16 h-16"/>
                    <span className="text-red-700 font-bold mt-2">Your Etherpad version is really outdated. Consider upgrading to a newer version.</span>
                </span>
            )}
            {instance.scan.is_public === false && (
                <span className="flex gap-5">
                    <Lock className="text-red-700 w-16 h-16"/>
                    <span className="font-bold mt-2">Your Etherpad instance is not public. This means it can only be accessed by authenticated users.</span>
                </span>
            )}
            <span>First seen: {new Date(instance.first_seen).toLocaleDateString()}</span>
        </div>
    );
};

