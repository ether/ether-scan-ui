import {StatsResponse} from "@/types/StatsResponse.ts";
import {FC, useMemo} from "react";
import {Bar} from "react-chartjs-2";
import "chart.js/auto";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";

type ApiVersionsProps = {
    stats: StatsResponse
}

export const ApiVersions: FC<ApiVersionsProps> = ({stats}) => {
    const labels = useMemo(()=>Object.keys(stats.api_versions),
        [stats])
    const data = useMemo(()=>{
            return [
                {
                    label: "API Versions",
                    data: Object.values(stats.api_versions),
                    backgroundColor: "#44b492",
                },

            ]
        },
        [stats])

    if(!labels||!data) return <div>Loading...</div>

   return <Card>
       <CardHeader>
           <CardTitle className="font-bold text-xl">API versions of Etherpad instances</CardTitle>
       </CardHeader>
       <CardContent>
           <Bar
               data={
                   {labels,datasets:data}
               }/>

       </CardContent>
       </Card>
}
