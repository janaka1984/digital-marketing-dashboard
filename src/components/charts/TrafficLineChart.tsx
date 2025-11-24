import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";

type TrafficItem = {
  day: string;
  count: number;
};

export default function TrafficLineChart({ data }: { data: TrafficItem[] }) {
  const theme = useTheme();

  const dates = data?.map((d: TrafficItem) => d.day) || [];
  const counts = data?.map((d: TrafficItem) => d.count) || [];

  const series = [{ name: "Events", data: counts }];

  const options: ApexOptions = {
    chart: { type: "line", toolbar: { show: false } },
    xaxis: {
      categories: dates,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#2065D1"],
    theme: { mode: theme.palette.mode },
  };

  return <Chart type="line" height={350} series={series} options={options} />;
}
