import type { NextPage } from "next";
import toast, { Toaster } from "react-hot-toast";

import Link from "next/link";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";

const Offline: NextPage = () => {
  return (
    <div>
      <Toaster />
      <div className="h-[10rem]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="text-center max-w-2xl mx-auto content-center">
        <h1 className="text-5xl font-bold sans dark:text-white">
          Kryptik App Requires An Internet Connection!
        </h1>
      </div>
      <div className="h-[10rem]">
        {/* padding div for space between top and main elements */}
      </div>
    </div>
  );
};

export default Offline;
