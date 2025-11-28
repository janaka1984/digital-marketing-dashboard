// src/components/charts/TrafficLineChart.tsx
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";

// ---- Types ----
interface DataPoint {
  day: string;
  count: number;
}

interface Props {
  data: DataPoint[];
  mini?: boolean;
}

export default function TrafficLineChart({ data = [], mini = false }: Props) {
  const theme = useTheme();

  const series = [
    {
      name: "Events",
      data: data.map((d) => d.count),
    },
  ];

  const categories = data.map((d) => d.day);

  const options: ApexCharts.ApexOptions = {
    chart: {
      animations: { enabled: true },
      toolbar: { show: !mini },
      height: mini ? 150 : 320,
      sparkline: { enabled: mini },
    },
    xaxis: {
      categories,
      labels: { show: !mini },
    },
    yaxis: {
      labels: { show: !mini },
    },
    stroke: {
      curve: "smooth", // FIX: valid union type
      width: mini ? 2 : 3,
    },
    grid: { show: !mini },
    theme: { mode: theme.palette.mode },
  };

  return (
    <Chart
      type="line"
      height={mini ? 150 : 320}
      series={series}
      options={options}
    />
  );
}
