import Link from "next/link";
import { getUserPhotoPath } from "../../src/helpers/auth";
import { defaultUser } from "../../src/models/user";
import { ServiceState } from "../../src/services/types";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import AvatarSmall from "./AvatarSmall";
import ProfileName from "./ProfileName";
import { useEffect, useState } from "react";

export function SidebarProfile() {
  const { authUser, kryptikService } = useKryptikAuthContext();
  const [totalBalance, setTotalBalance] = useState(0);
  useEffect(() => {
    if (kryptikService.serviceState == ServiceState.started) {
      setTotalBalance(kryptikService.kryptikBalances.getTotalBalance());
    }
  }, [kryptikService.kryptikBalances.getLastUpdateTimestamp()]);
  return (
    <div className="flex flex-row space-x-2">
      <div className="my-auto">
        <Link href="/">
          <AvatarSmall
            photoPath={getUserPhotoPath(authUser ? authUser : defaultUser)}
          />
        </Link>
      </div>

      <div className="flex flex-col text-lg">
        <div className="">
          <ProfileName isSmallText={true} />
        </div>

        {kryptikService.serviceState == ServiceState.started && (
          <p className="text-gray-500 dark:text-gray-400">
            ${totalBalance.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}
