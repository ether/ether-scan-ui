import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Instance, InstancesResponse, PluginData } from "@/types/InstancesResponse.ts";
import { AlertTriangle, Check, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { LoadingSpinner } from "@/components/ui/Spinner.tsx";
import { apiGet } from "@/lib/api.ts";

export const InstanceDetail = () => {
    const { name } = useParams<{ name: string }>();
    const [instance, setInstance] = useState<Instance>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        const fetchInstance = async () => {
            try {
                // Fetch all instances and find the one matching the name parameter
                const response = await apiGet<InstancesResponse>("/instances");
                const decodedName = decodeURIComponent(name || "");
                const found = response.instances.find(
                    (inst) => inst.name === decodedName || inst.name === `http://${decodedName}` || inst.name === `https://${decodedName}`
                );

                if (found) {
                    setInstance(found);
                } else {
                    setError(`Instance "${decodedName}" not found`);
                }
            } catch (err) {
                setError(`Failed to fetch instance: ${err instanceof Error ? err.message : "Unknown error"}`);
            } finally {
                setLoading(false);
            }
        };

        void fetchInstance();
    }, [name]);

    const isOldVersion = (version: string) => {
        const replacedVersion = version.replaceAll(".", "");
        return replacedVersion < "240";
    };

    const renderPluginInfo = (plugin: PluginData) => {
        if (plugin.version === null) {
            return <>{plugin.name}</>;
        }

        if (plugin.update_available) {
            return (
                <span className="text-red-700">
                    {plugin.name} (Update available: {plugin.version} {'=>'} {plugin.latest_version})
                </span>
            );
        }

        return <>{plugin.name} ({plugin.version})</>;
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="flex flex-col h-screen p-5">
                <h1 className="text-4xl font-bold mb-5">Instance Details</h1>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-red-700">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!instance) {
        return (
            <div className="flex flex-col h-screen p-5">
                <h1 className="text-4xl font-bold mb-5">Instance Details</h1>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-red-700">Instance not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const dbFailures = (instance.scan.db_reads_failed || 0) + (instance.scan.db_writes_failed || 0);

    return (
        <div className="flex flex-col h-screen p-5">
            <h1 className="text-4xl font-bold mb-5">Instance Details</h1>
            <h2 className="text-2xl mb-5">{instance.name}</h2>
            <p className="mb-5">
                Scan result from {new Date(instance.scan.scan_time).toLocaleString()}
            </p>

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
                                <li className="flex items-center gap-2">
                                    {isOldVersion(instance.scan.version) ? (
                                        <>
                                            <AlertTriangle className="text-yellow-400" size={18} />
                                            Version is outdated
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Version is up-to-date
                                        </>
                                    )}
                                </li>
                                {instance.scan.is_public === false && (
                                    <li className="flex items-center gap-2">
                                        <Lock className="text-red-700" size={18} />
                                        Instance is not public
                                    </li>
                                )}
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
                                {instance.scan.plugin_data.map((p) => (
                                    <li key={p.name}>{renderPluginInfo(p)}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {isOldVersion(instance.scan.version) && (
                    <div className="flex gap-5 bg-yellow-50 border border-yellow-200 p-4 rounded">
                        <AlertTriangle className="text-yellow-400 w-8 h-8 flex-shrink-0 mt-2" />
                        <span className="text-red-700 font-bold">
                            Your Etherpad version is really outdated. Consider upgrading to a newer version.
                        </span>
                    </div>
                )}

                {instance.scan.is_public === false && (
                    <div className="flex gap-5 bg-red-50 border border-red-200 p-4 rounded">
                        <Lock className="text-red-700 w-8 h-8 flex-shrink-0 mt-2" />
                        <span className="font-bold">
                            Your Etherpad instance is not public. This means it can only be accessed by authenticated users.
                        </span>
                    </div>
                )}

                <p className="text-sm text-gray-500">
                    First seen: {new Date(instance.first_seen).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

