export type StatsResponse = {
    plugins: {
        [key: string]: number
    },
    api_versions:{
        [key: string]: number
    },
    versions: {
        [key: string]: number
    }
}

export type PluginData = {
    plugin: string,
    count: number
}
