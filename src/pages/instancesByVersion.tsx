import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Bar} from "react-chartjs-2";
import {StatsResponse} from "@/types/StatsResponse.ts";
import {FC, useMemo} from "react";
import {LoadingSpinner} from "@/components/ui/Spinner.tsx";

type InstancesByVersionProps = {
    stats: StatsResponse
}


export const InstancesByVersion:FC<InstancesByVersionProps> = ({stats})=>{
    const labels = useMemo(()=>Object.keys(stats.versions),
        [stats])
    const data = useMemo(()=>{
            return [
                {
                    label: "API Versions",
                    data: Object.values(stats.versions),
                    backgroundColor: "#44b492",
                },

            ]
        },
        [stats])

    if(!labels||!data) return  <LoadingSpinner/>

    return  <Card>
        <CardHeader>
            <CardTitle className="font-bold text-xl">Etherpad version count</CardTitle>
        </CardHeader>
        <CardContent>
            <Bar
                data={
                    {labels,datasets:data}
                }/>

        </CardContent>
    </Card>
}
