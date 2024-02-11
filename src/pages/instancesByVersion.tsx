import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {FC, useEffect, useMemo, useState} from "react";
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";
import axios, {AxiosResponse} from "axios";
import {History, HistoryResponse} from "@/types/HistoryResponse.ts";
import {Line} from "react-chartjs-2";
import {ChartData} from "chart.js";
// @ts-ignore
import {ChartDataset} from "chart.js/dist/types";

export const InstancesByVersion: FC = () => {
    const [historyData, setHistoryData] = useState<HistoryResponse>()
    const data:any = useMemo(() => {
        if (!historyData || !historyData.versions) return {}
        const map = new Map<string, History[]>
        historyData?.versions.forEach(h => {
            if (!map.has(h.version)) {
                map.set(h.version, [])
            }
            map.get(h.version)?.push(h)
        })

        map.forEach((value, key) => {
            const sortedVals = value.sort((a, b) => {
                if (a.created_year !== b.created_year) {
                    return a.created_year - b.created_year
                }
                return a.created_month - b.created_month
            })
            map.set(key, sortedVals)
        })

        const labels: string[] = historyData.versions.reduce((acc:string[], curr) => {
            if (!acc.includes(curr.created_year+ "-" + curr.created_month)) {
                acc.push(curr.created_year+ "-" + curr.created_month)
            }
            return acc
        },[]).reverse()

        const datasets = Array.from(map).map(([_, value]) => {
            return {
                label: value[0].version,
                data: value.map(v => v.count),
                fill: false,
            } satisfies ChartDataset<"line", number>
        }).reverse()

        return {
            labels,
            datasets
        } satisfies  ChartData<"line", number[], string>


    }, [historyData])


    useEffect(() => {
        axios.get('/history')
            .then((historyData: AxiosResponse<HistoryResponse>) => {
                setHistoryData(historyData.data)
            })
    }, []);

    if (!data || !("labels" in data) || !("datasets" in data)) return <LoadingSpinner/>

    return <Card>
        <CardHeader>
            <CardTitle className="font-bold text-xl">Etherpad version count</CardTitle>
        </CardHeader>
        <CardContent>
            <Line data={{
                labels: data.labels,
                datasets: data.datasets
            }}/>
        </CardContent>
    </Card>
}
