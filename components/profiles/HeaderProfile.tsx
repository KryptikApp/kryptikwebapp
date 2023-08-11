import { NextPage } from "next";

import ProfileName from "./ProfileName";
import { getUserPhotoPath } from "../../src/helpers/auth";
import { defaultUser } from "../../src/models/user";
import AvatarMain from "../AvatarMain";
import { useKryptikAuthContext } from "../KryptikAuthProvider";

interface Props {
  center: boolean;
  showBio: boolean;
}

const HeaderProfile: NextPage<Props> = (props) => {
  const { center, showBio } = props;
  const { authUser } = useKryptikAuthContext();

  return (
    <div>
      {center ? (
        <div>
          <AvatarMain
            photoPath={getUserPhotoPath(authUser ? authUser : defaultUser)}
          />
          {/* show kryptik name if available... otherwise show ens name or truncated eth address */}
          <div>
            <ProfileName />
          </div>
          <div>
            {showBio && (
              <p className="text-slate-500 text-sm truncate dark:text-white">
                {authUser ? authUser.bio : ""}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-2 px-4 pt-12">
          <AvatarMain
            photoPath={getUserPhotoPath(authUser ? authUser : defaultUser)}
          />
          <div className="w-9/12 flex items-center">
            <div className="ml-2 w-10/12 flex flex-col leading-none items-start text-2xl">
              <div>
                <ProfileName />
              </div>
              {/* <div>
                {showBio && (
                  <p className="text-slate-500 text-sm dark:text-white">
                    {authUser ? authUser.bio : ""}
                  </p>
                )}
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderProfile;
