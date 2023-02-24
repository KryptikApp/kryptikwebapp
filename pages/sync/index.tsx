import type { NextPage } from "next";
import { motion } from "framer-motion";

// kryptik imports
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import Distributor from "../../components/sync/Distributor";
import Reciever from "../../components/sync/Reciever";
import { WalletStatus } from "../../src/models/KryptikWallet";

const Sync: NextPage = () => {
  const { walletStatus } = useKryptikAuthContext();

  return (
    <div className="text-black dark:text-white">
      <div className="h-[10vh]">
        {/* padding div for space between top and main elements */}
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        {walletStatus == WalletStatus.Connected && <Distributor />}
        {walletStatus == WalletStatus.OutOfSync && <Reciever />}
      </motion.div>
      {walletStatus == WalletStatus.Disconected && (
        <p className="text-center">
          Please connect your wallet before trying to sync.
        </p>
      )}
      {walletStatus == WalletStatus.Locked && (
        <p className="text-center">
          Please unlock your wallet before trying to sync.
        </p>
      )}

      <div className="h-[12rem]">
        {/* padding div for space between bottom and main elements */}
      </div>
    </div>
  );
};

export default Sync;
