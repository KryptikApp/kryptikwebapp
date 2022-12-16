import { NextPage } from "next";
import { Toaster } from "react-hot-toast";

export default function DevDocsHome() {
  return (
    <div className="md:max-h-[92vh] md:overflow-y-auto pt-10">
      <Toaster />

      <div className="text-black dark:text-white max-w-3xl mx-auto">
        <div className="mb-4">
          <p className="text-4xl font-bold mb-2">Developer Documentation</p>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            A builders manual for wallets. By builders, for builders.
          </p>
        </div>
        <div>
          <p className="text-xl font-semibold mb-1">What's Kryptik?</p>
          <div className="text-lg">
            <p>
              Kryptik is a noncustodial wallet for digital assets. The Kryptik
              wallet works across multiple blockchains and allows users to
              authenticate with simple magic links.
            </p>
          </div>
          <p className="my-4 text-md font-semibold">
            Note: Developer docs are new and actively being created.
          </p>
        </div>
      </div>
    </div>
  );
}
