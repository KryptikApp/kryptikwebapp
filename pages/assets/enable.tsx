import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import EnableAsset from "../../components/tokens/EnableAsset";
import { NetworkDb } from "../../src/services/models/network";
import { TokenDb } from "../../src/services/models/token";

const Enable: NextPage = () => {
  const { kryptikService } = useKryptikAuthContext();
  const [algoAssets, setAlgoAssets] = useState<TokenDb[]>([]);
  const [algoNetwork, setAlgoNetwork] = useState<NetworkDb | null>(null);
  useEffect(() => {
    const newAlgoNetwork: NetworkDb | null =
      kryptikService.getNetworkDbByTicker("algo");
    if (!newAlgoNetwork) {
      toast.error("Unable to fetch algorand network.");
      return;
    }
    const allTokens: TokenDb[] = kryptikService.getAllTokens(true);
    const newAlgoTokens: TokenDb[] = [];
    allTokens.map((t) => {
      for (const contract of t.contracts) {
        if (contract.networkId == newAlgoNetwork.id) {
          newAlgoTokens.push(t);
        }
      }
    });
    setAlgoAssets(newAlgoTokens);
    setAlgoNetwork(newAlgoNetwork);
    console.log(newAlgoTokens);
  }, []);
  return (
    <div className="max-w-xl mx-auto dark:text-white">
      <div className="h-[4vh]">
        {/* padding div for space between top and main elements */}
      </div>
      <div className="mb-8">
        <p className="text-2xl font-bold">Enable Assets</p>
        <p className="text-lg text-gray-800 dark:text-gray-100">
          Some assets on the Algorand blockchain must be enabled before use.
        </p>
      </div>
      {(!algoNetwork || algoAssets.length == 0) && (
        <div className="">
          <p className="text-lg font-semibold text-center">
            No assets to review.
          </p>
        </div>
      )}

      {algoNetwork &&
        algoAssets.length != 0 &&
        algoAssets.map((token) => (
          <EnableAsset token={token} network={algoNetwork} />
        ))}
    </div>
  );
};

export default Enable;
