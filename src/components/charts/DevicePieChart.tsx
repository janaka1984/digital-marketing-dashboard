import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";

type DeviceItem = {
  name: string;
  count: number;
};

export default function DevicePieChart({ data }: { data: DeviceItem[] }) {
  const theme = useTheme();

  const labels = data?.map((d: DeviceItem) => d.name || "Other") || [];
  const series = data?.map((d: DeviceItem) => d.count) || [];

  const options: ApexOptions = {
    labels,
    legend: { position: "bottom" },
    theme: { mode: theme.palette.mode },
    colors: ["#FF6B6B", "#FFB74D", "#64B5F6", "#81C784"],
  };

  return <Chart type="pie" height={320} series={series} options={options} />;
}
