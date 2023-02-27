import type { NextPage } from "next";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  ArcElement,
  DoughnutController,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { useKryptikThemeContext } from "../components/ThemeProvider";
import { AiOutlineLink } from "react-icons/ai";
import Link from "next/link";
import DemoCard from "../components/DemoCard";

const Demo: NextPage = () => {
  const { isDark } = useKryptikThemeContext();
  return (
    <div>
      <div className="dark:text-white">
        <div className="">
          <div className="min-h-[10vh]">
            {/* padding div for space between top and main elements */}
          </div>

          <div className="px-4 md:px-0  max-w-2xl mx-auto flex flex-col space-y-4">
            <h1 className="text-5xl text-left font-bold sans mb-5">Demos</h1>
            <DemoCard
              title={"Kryptik Sync"}
              src={
                "https://player.vimeo.com/video/802871414?h=c2cd6980c1&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=5847"
              }
              description={
                "Kryptik Sync is a new ability that allows anyone to share their wallet across devices in less than 60 seconds."
              }
            />
            <DemoCard
              title={"Kryptik V0"}
              src={
                "https://player.vimeo.com/video/800170803?h=312c376fda&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
              }
              description={
                "Kryptik is a simple wallet that lets you save, send, and collect value across the internet."
              }
            />
            <p className="text-md mt-8 text-gray-700 dark:text-gray-200 text-right">
              Check out the Kryptik blog{" "}
              <span className="text-sky-400">
                <Link href="../blog">here</Link>
              </span>{" "}
              📜
            </p>
          </div>

          <div className="min-h-[10vh]">
            {/* padding div for space between about and more info */}
          </div>
        </div>
      </div>

      <div className="h-[6rem]">
        {/* padding div for space between bottom and main elements */}
      </div>
    </div>
  );
};

export default Demo;
