import { Fragment, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import PairingCard from "../../components/connect/PairingCard";
import { useKryptikAuth } from "../../src/helpers/kryptikAuthHelper";

export default function PairingsPage() {
  const { signClient } = useKryptikAuth();
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
    <Fragment>
      <p className="text-2xl text-black dark:text-white">Pairings</p>
      {pairings.length ? (
        pairings.map((pairing) => {
          const { peerMetadata } = pairing;

          return (
            <PairingCard
              key={pairing.topic}
              icon={peerMetadata?.icons[0]}
              url={peerMetadata?.url}
              name={peerMetadata?.name}
              onDelete={() => onDelete(pairing.topic)}
            />
          );
        })
      ) : (
        <p></p>
      )}
    </Fragment>
  );
}
