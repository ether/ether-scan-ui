import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {FC, useEffect, useMemo, useState} from "react";
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";
import {HistoryResponse, HistoryVersionCountPerMonth} from "@/types/HistoryResponse.ts";
import {Line} from "react-chartjs-2";
import {ChartData} from "chart.js";
// @ts-ignore
import {ChartDataset} from "chart.js/dist/types";
import {apiGet} from "@/lib/api.ts";

export const InstancesByVersion: FC = () => {
    const [historyData, setHistoryData] = useState<HistoryResponse>()
    const data:any = useMemo(() => {
        if (!historyData || !historyData.history) return {}
        const map = new Map<string, HistoryVersionCountPerMonth[]>
        const labels = new Array<string>
        const showVersions = 8

        historyData.history.map((year) => {
            year.months.forEach((month) => {
                    labels.push(`${year.year}-${month.month}`)
            })
        })

        let dataAdded = new Array<number>
        let dataRemoved = new Array<number>

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
        const allDatasets: ChartDataset[]  = Array.from(map).map(([_, value]) => {
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
        })

        function getColorForVersion(versionString) {
            // extract major and minor version
            const [major, minor] = versionString.split('.').map(Number);

            let hue = 0; // default: red
            if (major === 2) hue = 220; // blue
            if (major === 3) hue = 100; // green
            if (major === 4) hue = 280; // purple
            if (major > 4) hue = (major * 60) % 360; // fallback

            // lightness
            const baseLightness = 40;
            const minorStep = 5;
            const lightness = Math.min(baseLightness + ((minor || 0) * minorStep), 80);

            return `hsl(${hue}, 85%, ${lightness}%)`;
        }

        let datasets: ChartDataset[] = []
        let tmpDataset: null|ChartDataset = null

        allDatasets.slice(0, -showVersions).forEach((dataset: ChartDataset) => {
            const label = dataset.label?.substring(0, 1) + '.x'
            if (tmpDataset === null || tmpDataset.label !== label) {
                if (tmpDataset !== null) {
                    datasets.push(tmpDataset)
                }
                tmpDataset = dataset

                tmpDataset.label = label
                tmpDataset.hidden = true
                return
            }
            if (tmpDataset.label === label) {
                dataset.data.forEach((element, index) => {
                    tmpDataset.data[index] = tmpDataset.data[index] + element
                })
            }
        })

        datasets.push(tmpDataset)
        datasets.push(...allDatasets.slice(-showVersions))

        datasets.forEach((dataset) => {
            const color = getColorForVersion(dataset.label)

            dataset.borderColor = color;
            dataset.backgroundColor = color;
        })

        // Set added instances for first month to zero
        dataAdded[0] = 0

        datasets.push({
            type: 'bar' as const,
            label: "Instances added",
            data: dataAdded,
            backgroundColor: 'rgba(50, 200, 52, 0.3)',
        })

        datasets.push({
            type: 'bar' as const,
            label: "Instances removed",
            data: dataRemoved,
            backgroundColor: 'rgba(173, 65, 50, 0.3)',
        })

        return {
            labels,
            datasets
        } satisfies  ChartData<"line", number[], string>


    }, [historyData])


    useEffect(() => {
        apiGet<HistoryResponse>('/history')
            .then((historyData) => {
                setHistoryData(historyData)
            })
    }, []);

    if (!data || !("labels" in data) || !("datasets" in data)) return <LoadingSpinner/>

    return <Card>
        <CardHeader>
            <CardTitle className="font-bold text-xl">Etherpad versions</CardTitle>
        </CardHeader>
        <CardContent>
            <div style={{position: 'relative', height: "80vh", width: '100%'}}>
                <Line
                    options={{
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                stacked: true,
                            }
                        },
                    }}
                    data={{
                        labels: data.labels,
                        datasets: data.datasets
                    }}/>
            </div>
        </CardContent>
    </Card>
}
