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
    plugins: string[]
}
