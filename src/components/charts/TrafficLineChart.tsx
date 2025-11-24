import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";

export default function TrafficLineChart({ data }) {
  const theme = useTheme();
  const dates = data?.map((d) => d.day) || [];
  const counts = data?.map((d) => d.count) || [];

  const series = [{ name: "Events", data: counts }];

  const options = {
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
