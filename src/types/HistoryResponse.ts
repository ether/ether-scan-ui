export type History = {
    created_year: number
    created_month: number
    version: string
    count: number
}

export type HistoryYearResponse = {
    year: number,
    months: HistoryMonthResponse[]
}

export type HistoryVersionCountPerMonth = {
    version: string,
    count: number,
    month: number,
    year: number
}

export type HistoryMonthResponse = {
    month: number,
    versions: HistoryVersionCountPerMonth[]
}

export type HistoryResponse = {
    versions: History[],
    history: HistoryYearResponse[]
}
