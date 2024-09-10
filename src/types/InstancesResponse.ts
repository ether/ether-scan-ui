export type InstancesResponse = {
    instances: Instance[]
}

export type Instance = {
    name: string,
    scan: ScanResult
}

type ScanResult = {
    api_version: string,
    version: string,
    scan_time: string,
    plugins: string[],
    plugin_data: PluginData[],
    websocket_available: boolean | null,
    db_reads_failed: number,
    db_writes_failed: number,
}

export type PluginData = {
    name: string,
    version: string,
    latest_version: string | null,
    update_available: boolean,
}