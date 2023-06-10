import { Authenticator } from "@prisma/client";
import { getAllPasskeys } from "../../src/helpers/auth/passkey";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { useEffect, useState } from "react";
import DateFormatter from "../time/DateFormatter";
import LoadingSpinner from "../loadingSpinner";

type Props = {
  // workaround to trigger refresh of passkey data
  refreshCount: number;
};

export default function PassKeyList(props: Props) {
  const { authUser } = useKryptikAuthContext();
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [passkeys, setPasskeys] = useState<Authenticator[] | null>(null);
  async function refreshPasskeys() {
    if (!authUser) {
      setIsError(true);
      setErrorMessage("You must be logged in to view your passkeys.");
      return;
    }
    try {
      setIsError(false);
      setLoading(true);
      const passkeys = await getAllPasskeys();
      setPasskeys(passkeys);
      setLoading(false);
    } catch (e) {
      setIsError(true);
      setErrorMessage("Error loading passkeys.");
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshPasskeys();
  }, [props.refreshCount]);

  return (
    <div className="transition-colors duration-300 rounded-xl py-2 my-2">
      <h1 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1 text-left">
        Passkeys
      </h1>
      <p className="text-md text-slate-500">
        Passkeys associated with your account.
      </p>
      <div className="flex flex-col">
        {/* passkeys available */}
        {passkeys != null &&
          !loading &&
          passkeys.length != 0 &&
          passkeys.map((passkey) => {
            return (
              <div
                key={passkey.credentialID}
                className="flex flex-row rounded-xl py-1 transition-transform duration-300 bg-gray-50/20 dark:bg-gray-900/20 hover:brightness-80 dark:hover:brightness-150"
              >
                <p className="text-xl dark:text-gray-200 text-gray-700">
                  {passkey.name}
                </p>
                <div className="flex-grow">
                  <div className="float-right">
                    <DateFormatter
                      dateString={new Date(passkey.createdAt).toDateString()}
                      isPast={true}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        {/* loading */}
        {loading && (
          <div className="mx-auto flex flex-row space-x-2">
            <p className="text-lg dark:text-slate-300 text-slate-700 font-semibold text-center">
              Loading...
            </p>
            <LoadingSpinner />
          </div>
        )}
        {/* no passkeys available */}
        {!loading && passkeys != null && passkeys.length == 0 && (
          <p className="text-lg font-semibold text-left">No passkeys found.</p>
        )}
      </div>
    </div>
  );
}
