import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {FC, useEffect, useMemo, useState} from "react";
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";
import axios, {AxiosResponse} from "axios";
import {HistoryResponse, HistoryVersionCountPerMonth} from "@/types/HistoryResponse.ts";
import {Line} from "react-chartjs-2";
import {ChartData} from "chart.js";
// @ts-ignore
import {ChartDataset} from "chart.js/dist/types";

export const InstancesByVersion: FC = () => {
    const [historyData, setHistoryData] = useState<HistoryResponse>()
    const data:any = useMemo(() => {
        if (!historyData || !historyData.history) return {}
        const map = new Map<string, HistoryVersionCountPerMonth[]>
        const labels = new Array<string>


        historyData.history.map((year) => {
            year.months.forEach((month) => {
                    labels.push(`${year.year}-${month.month}`)
            })
        })

        let dataAdded = new Array<>
        let dataRemoved = new Array<>

        historyData.history.map((year) => {
            year.months.forEach((month) => {
                dataAdded.push(month.added)
                dataRemoved.push(month.removed * -1)

                month.versions.forEach((version) => {
                    if (map.has(version.version)) {
                        map.get(version.version)?.push({version: version.version, count: version.count, month: month.month, year: year.year})
                    } else {
                        map.set(version.version, [{version: version.version, count: version.count, month: month.month, year: year.year}])
                    }
                })
            })
        })

        // fill in the gaps
        map.forEach((value, key) => {
            const missing = labels.filter(label => !value.some(v => `${v.year}-${v.month}` === label))
            missing.forEach(m => {
                value.push({version: key, count: 0, month: parseInt(m.split("-")[1]), year: parseInt(m.split("-")[0])})
            })
            value.sort((a, b) => {
                return a.year - b.year || a.month - b.month
            })
        })

        // Limit to last 10 versions
        let datasets = Array.from(map).map(([_, value]) => {
            return {
                label: value[0].version,
                data: value.map(v => v.count),
                fill: false,
            } satisfies ChartDataset<"line", number>
            // @ts-ignore
        }).sort((a, b) => {
            // compare version numbers
            const aVersion = a.label.split(".").map((v: string) => parseInt(v))
            const bVersion = b.label.split(".").map((v: string) => parseInt(v))
            for (let i = 0; i < aVersion.length; i++) {
                if (aVersion[i] < bVersion[i]) return -1
                if (aVersion[i] > bVersion[i]) return 1
                if (i === aVersion.length - 1) return 0
            }
        }).slice(-10)

        datasets.push({
            type: 'bar' as const,
            label: "Instances added",
            data: dataAdded,
        })

        datasets.push({
            type: 'bar' as const,
            label: "Instances removed",
            data: dataRemoved,
        })

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
            <Line
                options={{
                    scales: {
                        x: {
                            stacked: true,
                        }
                    }
                }}
                data={{
                    labels: data.labels,
                    datasets: data.datasets
                }}/>
        </CardContent>
    </Card>
}
