import Link from "next/link";
import { Fragment, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import PairingCard from "../../components/connect/PairingCard";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import { useKryptikAuth } from "../../src/helpers/kryptikAuthHelper";

export default function PairingsPage() {
  const { signClient } = useKryptikAuthContext();
  const [pairings, setPairings] = useState(signClient?.pairing.values || []);

  async function onDelete(topic: string) {
    if (!signClient) {
      toast.error("Unable to disconnect.");
      return;
    }
    // TODO: ENSURE CODE IS CORECT FOR ERROR RESPONSE
    await signClient.disconnect({
      topic,
      reason: { code: 0, message: "User disconnected." },
    });
    const newPairings = pairings.filter((pairing) => pairing.topic !== topic);
    setPairings(newPairings);
  }

  return (
    <div className="mx-auto max-w-3xl dark:text-white mt-8">
      <p className="text-4xl text-black dark:text-white font-bold">Pairings</p>
      <p className="text-lg text-slate-700 dark:text-slate-200">
        Review apps you have connected with in the past.
      </p>
      {pairings.length != 0 && (
        <div className="flex flex-col space-y-2 my-6">
          {pairings.map((pairing) => {
            const { peerMetadata } = pairing;

            return (
              <PairingCard
                key={pairing.topic}
                icon={peerMetadata?.icons[0]}
                url={peerMetadata?.url}
                name={peerMetadata?.name}
                description={peerMetadata?.description}
                onDelete={() => onDelete(pairing.topic)}
              />
            );
          })}
        </div>
      )}
      {pairings.length == 0 && (
        <div>
          <p className="text-red-400">No connections.</p>
          <div className="max-w-md border border-gray-400 dark:border-gray-500 py-2 px-2 mx-auto px-4 rounded rounded-lg mt-4 text-slate-700 dark:text-slate-200 text-lg">
            <p>Connect to a new application.</p>
            <Link
              className="w-full text-center text-sky-400 hover:text-sky-500 font-semibold"
              href="../connect"
            >
              Add Connection
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
