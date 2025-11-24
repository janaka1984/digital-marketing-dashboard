import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";

export default function DevicePieChart({ data }) {
  const theme = useTheme();

  const labels = data?.map((d) => d.name || "Other") || [];

  const series = data?.map((d) => d.count) || [];

  const options = {
    labels,
    legend: { position: "bottom" },
    theme: { mode: theme.palette.mode },
    colors: ["#FF6B6B", "#FFB74D", "#64B5F6", "#81C784"],
  };

  return <Chart type="pie" height={320} series={series} options={options} />;
}
