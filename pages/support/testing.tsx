import type { NextPage } from "next";
import Link from "next/link";

const Testing: NextPage = () => {
  return (
    <div>
      <div className="h-[4vh]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="dark:text-white">
        <div className="max-w-2xl mx-auto px-4 md:px-0">
          <div className="mb-12">
            <h1 className="text-5xl font-bold sans mb-5">You're Excited!</h1>
            <p className="leading-loose text-2xl text-justify">
              <span className="text-sky-500 dark:text-sky-400 font-semibold">
                So are we (:
              </span>
            </p>
            <p className="leading-loose mb-2 text-xl text-justify">
              Right now... the Kryptik wallet is being improved by a small group
              of testers. Your spot on the waitlist has been{" "}
              <span className="text-green-500 dark:text-green-400">
                reserved
              </span>{" "}
              and we will notify you when your Kryptik journey begins. Thanks
              for stopping by and have a great day 👋🏼!
            </p>
          </div>
        </div>
      </div>

      <div className="h-[4rem]">
        {/* padding div for space between top and main elements */}
      </div>
    </div>
  );
};

export default Testing;
