import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";

export default function TrafficLineChart({ data, mini = false }) {
  const theme = useTheme();

  const series = [
    {
      name: "Events",
      data: data?.map((d) => d.count) || [],
    },
  ];

  const categories = data?.map((d) => d.day) || [];

  const options = {
    chart: {
      animations: { enabled: true },
      toolbar: { show: !mini },
      height: mini ? 150 : 320,
      sparkline: { enabled: mini }, // mini mode
    },
    xaxis: {
      categories,
      labels: { show: !mini }, // hide labels in mini
    },
    yaxis: {
      labels: { show: !mini },
    },
    stroke: {
      curve: "smooth",
      width: mini ? 2 : 3,
    },
    grid: { show: !mini },
    theme: { mode: theme.palette.mode },
  };

  return <Chart type="line" height={mini ? 150 : 320} series={series} options={options} />;
}
