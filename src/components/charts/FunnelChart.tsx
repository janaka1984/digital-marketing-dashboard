import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";

type FunnelData = {
  pageviews: number;
  clicks: number;
  initiated: number;
  purchases: number;
};

export default function FunnelChart({ data }: { data: FunnelData }) {
  const theme = useTheme();

  const categories = ["Pageviews", "Clicks", "Initiated", "Purchases"];
  const values = [
    data?.pageviews || 0,
    data?.clicks || 0,
    data?.initiated || 0,
    data?.purchases || 0,
  ];

  const series = [{ name: "Funnel", data: values }];

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        barHeight: "70%",
      },
    },
    xaxis: { categories },
    colors: ["#2065D1", "#FF6B6B", "#1ABC9C", "#F39C12"],
    theme: { mode: theme.palette.mode },
  };

  return <Chart type="bar" height={300} series={series} options={options} />;
}
