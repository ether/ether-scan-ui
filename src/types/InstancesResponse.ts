export type InstancesResponse = {
    instances: Instance[]
}

export type Instance = {
    name: string,
    first_seen: string,
    scan: ScanResult
}

type ScanResult = {
    api_version: string,
    is_public: boolean | null,
    title: string | null,
    version: string,
    scan_time: string,
    plugins: string[],
    plugin_data: PluginData[],
    mean_connects: number | null,
    websocket_available: boolean | null,
    db_reads_failed: number,
    db_writes_failed: number,
}

export type PluginData = {
    name: string,
    version: string | null,
    latest_version: string | null,
    update_available: boolean,
    old: boolean | null,
    deleted: boolean | null,
}
