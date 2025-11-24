import Chart from "react-apexcharts";
import { useTheme } from "@mui/material";

export default function TopSourcesBarChart({ data }) {
  const theme = useTheme();

  // Normalize & dedupe categories
  const categories = Array.from(
    new Set(
      data?.map((d) =>
        (d.src || "Unknown")
          .trim()
          .replace(/^"|"$/g, "")
          .toLowerCase()
      ) || []
    )
  );

  // Recalculate counts for each normalized category
  const counts = categories.map((cat) =>
    data
      .filter(
        (d) =>
          (d.src || "Unknown")
            .trim()
            .replace(/^"|"$/g, "")
            .toLowerCase() === cat
      )
      .reduce((sum, d) => sum + d.count, 0)
  );

  const series = [{ name: "Events", data: counts }];

  const options = {
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
