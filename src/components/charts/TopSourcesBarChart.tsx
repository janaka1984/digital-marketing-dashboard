import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";

type SourceItem = {
  src: string | null;
  count: number;
};

export default function TopSourcesBarChart({ data }: { data: SourceItem[] }) {
  const theme = useTheme();

  const categories = Array.from(
    new Set(
      data?.map((d: SourceItem) =>
        (d.src || "Unknown").trim().replace(/^"|"$/g, "").toLowerCase()
      ) || []
    )
  );

  const counts = categories.map((cat: string) =>
    data
      .filter(
        (d: SourceItem) =>
          (d.src || "Unknown").trim().replace(/^"|"$/g, "").toLowerCase() === cat
      )
      .reduce((sum: number, d: SourceItem) => sum + d.count, 0)
  );

  const series = [{ name: "Events", data: counts }];

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: {
      categories,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    plotOptions: { bar: { borderRadius: 5, columnWidth: "50%" } },
    colors: ["#1ABC9C"],
    theme: { mode: theme.palette.mode },
  };

  return <Chart type="bar" height={350} series={series} options={options} />;
}
