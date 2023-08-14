import { NextPage } from "next";

export default function NetworkAddressLoader() {
  return (
    <div className="rounded-lg">
      <div className="w-full rounded-lg p-2 flex flex-col  bg-white bg-opacity-40 dark:bg-black border border-2">
        <div className="flex flex-row space-x-2 px-2">
          <div className="flex-shrink-0 min-w-[48px]">
            <div className="w-10 h-10 mt-2 rounded-full animate-pulse bg-slate-400" />
          </div>
          <div className="flex flex-col space-y-2">
            <p className="w-28 h-6 animate-pulse animate-pulse bg-slate-400 rounded-lg"></p>
            <p className="text-slate-600 dark:text-slate-300 text-md w-12 h-4 animate-pulse bg-slate-400 rounded-lg"></p>
          </div>
        </div>
      </div>
    </div>
  );
}
