import { ProposalTypes } from "@walletconnect/types/dist/types/sign-client";
import { Fragment } from "react";
import { namespaceIdToName } from "../../src/handlers/connect/utils";
import { NetworkDb } from "../../src/services/models/network";
import { useKryptikAuthContext } from "../KryptikAuthProvider";

interface IProps {
  requiredNamespace: ProposalTypes.RequiredNamespace;
}

export default function PermissionsCard({ requiredNamespace }: IProps) {
  const { kryptikService } = useKryptikAuthContext();
  return (
    <Fragment>
      {requiredNamespace.chains.map((chainId: string) => {
        const extensionMethods: ProposalTypes.RequiredNamespace["methods"] = [];
        const extensionEvents: ProposalTypes.RequiredNamespace["events"] = [];

        const allMethods = [...requiredNamespace.methods, ...extensionMethods];
        const allEvents = [...requiredNamespace.events, ...extensionEvents];

        const networkDb: NetworkDb | null =
          kryptikService.getNetworkDbByBlockchainId(chainId);

        return (
          <div key={chainId} className="w-full">
            {networkDb ? (
              <div
                className="text-white flex flex-col bg-gray-200 dark:bg-gray-700 rounded rounded-lg px-2 py-2
                "
                style={{ outline: "solid", outlineColor: networkDb.hexColor }}
              >
                <p
                  className="text-lg font-bold mb-1"
                  style={{ color: networkDb.hexColor }}
                >
                  {namespaceIdToName(chainId)}
                </p>
                <div className="flex-col">
                  <p className="text-gray-600 dark:text-gray-100">Methods:</p>
                  <p className="text-md text-gray-500 dark:text-gray-400">
                    {allMethods.length ? allMethods.join(", ") : "None"}
                  </p>
                </div>
                <div className="flex-col">
                  <p>Events:</p>
                  <p className="text-md text-gray-500 dark:text-gray-400">
                    {allEvents.length ? allEvents.join(", ") : "None"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-sky-400 h-20">
                <p>Unknown permissions.</p>
              </div>
            )}
          </div>
        );
      })}
    </Fragment>
  );
}
