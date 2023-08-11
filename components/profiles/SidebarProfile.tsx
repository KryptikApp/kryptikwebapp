import { getUserPhotoPath } from "../../src/helpers/auth";
import { defaultUser } from "../../src/models/user";
import { ServiceState } from "../../src/services/types";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import AvatarSmall from "./AvatarSmall";
import ProfileName from "./ProfileName";

export function SidebarProfile() {
  const { authUser, kryptikService } = useKryptikAuthContext();
  return (
    <div className="flex flex-row space-x-2">
      <div className="my-auto">
        <AvatarSmall
          photoPath={getUserPhotoPath(authUser ? authUser : defaultUser)}
        />
      </div>

      <div className="flex flex-col text-lg">
        <ProfileName />
        {kryptikService.serviceState == ServiceState.started && (
          <p className="text-gray-500 dark:text-gray-400">
            ${kryptikService.kryptikBalances.getTotalBalance()}
          </p>
        )}
      </div>
    </div>
  );
}
