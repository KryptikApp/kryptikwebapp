import type { NextPage } from "next";
import FAQ from "../../components/support/FAQ";
import { FAQs } from "../../src/support/FAQ";
import { IQuestionAnswer } from "../../src/support/FAQ/models";

const Terms: NextPage = () => {
  return (
    <div>
      <div className="h-[4vh]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="dark:text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-0">
          <div className="mb-12">
            <h1 className="text-3xl font-bold sans mb-5">
              Kryptik Wallet terms of Use
            </h1>
            <h1 className="font-semibold text-xl text-slate-800 dark:text-slate-200">
              Updated: August 1st, 2022
            </h1>
            <p className="text-xl">
              You may download our terms of use{" "}
              <a
                href="/support/terms/Kryptik Wallet Terms Of Use.pdf"
                className="text-sky-400"
                download
              >
                here
              </a>
              .
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

export default Terms;
