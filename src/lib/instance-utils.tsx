import {ReactNode} from "react";
import {Instance, PluginData} from "@/types/InstancesResponse.ts";

export const isOldVersion = (version: string) => {
    const replacedVersion = version.replaceAll(".", "");
    return replacedVersion < "240";
};

export const getDbFailures = (instance: Instance) => {
    return (instance.scan.db_reads_failed || 0) + (instance.scan.db_writes_failed || 0);
};

export const renderPluginInfo = (plugin: PluginData): ReactNode => {
    if (plugin.version === null) {
        return plugin.name;
    }

    if (plugin.update_available) {
        return (
            <span className="text-red-700">
                {plugin.name} (Update available: {plugin.version} {"=>"} {plugin.latest_version})
            </span>
        );
    }

    return `${plugin.name} (${plugin.version})`;
};

export const findInstanceByName = (instances: Instance[], rawName: string) => {
    return instances.find((instance) =>
        instance.name === rawName ||
        instance.name === `http://${rawName}` ||
        instance.name === `https://${rawName}`,
    );
};

