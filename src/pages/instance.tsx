import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Instance, InstancesResponse } from "@/types/InstancesResponse.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { LoadingSpinner } from "@/components/ui/Spinner.tsx";
import { apiGet } from "@/lib/api.ts";
import { findInstanceByName } from "@/lib/instance-utils.tsx";
import { InstanceDetails } from "@/components/instances/instance-details.tsx";

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
                const found = findInstanceByName(response.instances, decodedName);

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

    return (
        <div className="flex flex-col h-screen p-5">
            <h1 className="text-4xl font-bold mb-5">Instance Details</h1>
            <h2 className="text-2xl mb-5">{instance.name}</h2>
            <p className="mb-5">
                Scanned on: {new Date(instance.scan.scan_time).toLocaleString()}
            </p>

            <InstanceDetails instance={instance} />
        </div>
    );
};

