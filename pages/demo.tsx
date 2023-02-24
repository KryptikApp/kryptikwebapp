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

const Demo: NextPage = () => {
  const { isDark } = useKryptikThemeContext();
  return (
    <div>
      <div className="dark:text-white">
        <div className="min-h-[100vh]">
          <div className="min-h-[20vh]">
            {/* padding div for space between top and main elements */}
          </div>

          <div className="px-4 md:px-0  max-w-2xl mx-auto">
            <h1 className="text-5xl text-left font-bold sans mb-5">
              <span className="">Kryptik</span> Wallet Demo
            </h1>
            {/* demo video */}
            <div>
              <iframe
                src="https://player.vimeo.com/video/800170803?h=312c376fda&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                allow="autoplay; fullscreen; picture-in-picture"
                width="640"
                height="360"
                className="w-[100%]"
                allowFullScreen
              ></iframe>
            </div>
            <p className="leading-loose my-4 text-xl text-justify dark:text-gray-400">
              Kryptik is a simple wallet that lets you save, send, and collect
              value across the internet.
            </p>
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
