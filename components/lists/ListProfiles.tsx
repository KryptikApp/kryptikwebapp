import { useEffect, useState } from "react";
import { loadTopProfiles } from "../../src/explore/profiles/topProfiles";
import { IResolvedAccount } from "../../src/helpers/resolvers/accountResolver";
import PillProfile, { PillProfileLoading } from "../profiles/PillProfile";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { ServiceState } from "../../src/services/types";

export default function ListProfiles() {
  const [topProfiles, setTopProfiles] = useState<null | IResolvedAccount[]>(
    null
  );
  const { kryptikService } = useKryptikAuthContext();

  async function getProfiles() {
    const maxRetries = 20;
    let retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        console.log("loading top profiles...");
        const newTopAccounts = await loadTopProfiles(kryptikService);
        setTopProfiles(newTopAccounts);
        return;
      } catch (e) {
        console.warn("retrying");
        // wait .25 second
        await new Promise((r) => setTimeout(r, 250));
        retryCount++;
      }
    }
  }

  const loadingQuantity = 6;

  useEffect(() => {
    console.log("Running effect");
    if (topProfiles && topProfiles.length > 0) return;
    if (kryptikService.serviceState != ServiceState.started) {
      kryptikService.StartSevice();
      return;
    }
    console.log(kryptikService);
    getProfiles();
  }, [kryptikService.serviceState, kryptikService.NetworkDbs]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {topProfiles &&
        topProfiles.map((p, _) => <PillProfile account={p} key={_} />)}
      {!topProfiles &&
        Array(loadingQuantity)
          .fill(0)
          .map((_) => <PillProfileLoading key={_} />)}
    </div>
  );
}
