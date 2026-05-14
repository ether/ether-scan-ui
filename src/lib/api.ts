export class ApiError<T = unknown> extends Error {
    status: number
    data?: T

    constructor(message: string, status: number, data?: T) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.data = data
    }
}

type QueryParams = Record<string, string | number | boolean | null | undefined>

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: BodyInit | null
    params?: QueryParams
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL

const isAbsoluteUrl = /^https?:\/\//i.test(API_BASE_URL)

const joinPaths = (basePath: string, path: string) => {
    const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath
    const normalizedPath = path.startsWith("/") ? path : `/${path}`

    if (!normalizedBase) {
        return normalizedPath
    }

    return `${normalizedBase}${normalizedPath}`
}

const buildUrl = (path: string, params?: QueryParams) => {
    if (isAbsoluteUrl) {
        const url = new URL(path, API_BASE_URL)

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.set(key, String(value))
                }
            })
        }

        return url.toString()
    }

    const url = joinPaths(API_BASE_URL, path)
    const searchParams = new URLSearchParams()

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                searchParams.set(key, String(value))
            }
        })
    }

    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
}

const parseErrorResponse = async <T>(response: Response): Promise<T | undefined> => {
    const contentType = response.headers.get("content-type")

    if (contentType?.includes("application/json")) {
        return response.json() as Promise<T>
    }

    const text = await response.text()
    if (!text) {
        return undefined
    }

    return { error: text } as T
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const { params, ...fetchOptions } = options
    const response = await fetch(buildUrl(path, params), fetchOptions)

    if (!response.ok) {
        const errorData = await parseErrorResponse(response)
        throw new ApiError(`Request failed with status ${response.status}`, response.status, errorData)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}

export const apiGet = <T>(path: string) => {
    return request<T>(path, { method: "GET" })
}

export const apiPost = <T>(path: string, options: RequestOptions = {}) => {
    return request<T>(path, { ...options, method: "POST" })
}


