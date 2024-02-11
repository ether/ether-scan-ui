export type History = {
    created_year: number
    created_month: number
    version: string
    count: number
}

export type HistoryResponse = {
    versions: History[]
}
