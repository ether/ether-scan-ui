import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {
    Pagination,
    PaginationContent, PaginationEllipsis,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination.tsx";
import {FC, useEffect, useMemo, useState} from "react";
import {PluginData, StatsResponse} from "@/types/StatsResponse.ts";

type PluginPros = {
    stats: StatsResponse
}


export const Plugins:FC<PluginPros> = ({stats})=>{
    const [totalPages, setTotalPages] = useState<number>(0)
    const [plugins, setPlugins] = useState<PluginData[]>()
    const [currentPage, setCurrentPage] = useState<number>(0)
    const currentPlugins = useMemo(()=>{
        return plugins?.slice((currentPage-1)*10, currentPage*10)
    }, [currentPage])


    useEffect(() => {
        setPlugins(Object.keys(stats.plugins).map((plugin)=>{
            const pluginCount = stats.plugins[plugin]
            return {
                plugin,
                count: pluginCount
            } satisfies PluginData
        }))

        setTotalPages(Math.ceil(Object.keys(stats.plugins).length/10))
        setCurrentPage(1)
    }, [])

    if (!plugins||!currentPlugins) return <div>Loading...</div>


    return <Card className="">
        <CardHeader>
            <CardTitle className="font-bold text-xl">Used plugins by number</CardTitle>
        </CardHeader>
        <CardContent>
            <table className="w-full table-fixed">
                <thead>
                <tr>
                    <th>Plugin</th>
                    <th>Count</th>
                </tr>
                </thead>
                <tbody className="overflow-auto divide-y">
                {
                    currentPlugins.map((plugin) => {
                        return (
                            <tr className="">
                                <td className="p-0.5">{plugin.plugin}</td>
                                <td className="text-center p-0.5">{plugin.count}</td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        {currentPage > 1 &&
                            <PaginationPrevious className="cursor-pointer select-none" onClick={() => {
                                if (currentPage > 1) setCurrentPage(currentPage - 1)
                            }}/>}
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                    </PaginationItem>
                    {
                        currentPage > 2 && <PaginationItem>
                            <PaginationEllipsis/>
                        </PaginationItem>
                    }
                    {currentPage > 1 && currentPage < totalPages && <PaginationItem>
                        <PaginationLink>{currentPage}</PaginationLink>
                    </PaginationItem>}
                    {currentPage < totalPages - 1 && <PaginationItem>
                        <PaginationEllipsis/>
                    </PaginationItem>}
                    <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        {currentPage != totalPages &&
                            <PaginationNext className="cursor-pointer select-none" onClick={() => {
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                            }}/>
                        }
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </CardContent>
    </Card>
}
