import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

export default function ApyChart(props) {
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

  const options = {
    responsive: true,
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "right",
      },
    },
  };

  const labels = ["January", "February", "March", "April"];

  const data = {
    labels: labels,
    datasets: [
      {
        label: "APY",
        data: labels.map(() => faker.number.int({ min: 1, max: 100 })),
        borderColor: "rgba(53, 162, 235, 1)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "y",
      },
    ],
  };

  return <Line options={options} data={data} />;
}
