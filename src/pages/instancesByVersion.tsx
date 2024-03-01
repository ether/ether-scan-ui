import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {FC, useEffect, useMemo, useState} from "react";
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";
import axios, {AxiosResponse} from "axios";
import {HistoryResponse, HistoryVersionCountPerMonth} from "@/types/HistoryResponse.ts";
import {Line} from "react-chartjs-2";
import {ChartData} from "chart.js";
// @ts-ignore
import {ChartDataset} from "chart.js/dist/types";

function generateMatchingColors(num: number): string[] {
    let colors: string[] = [];
    let saturation = 100;
    let lightness = 60;
    for(let i = 0; i < num; i++) {
        let hue = (i * 360 / num) % 360;
        colors.push(`hsla(${hue},${saturation}%,${lightness}%,1)`);
    }
    return colors;
}

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


        historyData.history.map((year) => {
            year.months.forEach((month) => {
                month.versions.forEach((version) => {
                    if (map.has(version.version)) {
                        map.get(version.version)?.push({version: version.version, count: version.count, month: month.month, year: year.year})
                    } else {
                        map.set(version.version, [{version: version.version, count: version.count, month: month.month, year: year.year}])
                    }
                })
            })
        })

        const matchingColors = generateMatchingColors(map.size)
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
                borderColor: matchingColors.shift(),
            } satisfies ChartDataset<"line", number>
        }).sort((a, b) => {
            return a.label.localeCompare(b.label)
        }).slice(-10)

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
