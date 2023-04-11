import { NextPage } from "next";
import { removeHttp } from "../../src/helpers/utils";
import { NetworkDb } from "../../src/services/models/network";

type Props = {
  icon: string | undefined;
  name: string | undefined;
  description: string | undefined;
  url: string | undefined;
  network?: NetworkDb;
};

const AppDetails: NextPage<Props> = (props) => {
  const { icon, name, description, url, network } = { ...props };
  const urlToDisplay: string = url ? removeHttp(url) : "";
  return (
    <div className="w-max dark:text-white rounded-md flex flex-row space-x-2">
      <div className="flex">
        {icon && icon.length > 4 ? (
          <img className="h-14 w-14 rounded-full" src={icon}></img>
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-400 dark:bg-gray-500"></div>
        )}
        {network && (
          <img
            className="w-6 h-6 mt-8 -ml-3 drop-shadow-lg rounded-full inline"
            src={network.iconPath}
            alt={`${network.fullName} icon`}
          />
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-xl">{name || "Unknown"}</p>
        <p className="text-md text-slate-500 dark:text-slate-400">
          {urlToDisplay}
        </p>
      </div>
    </div>
  );
};

export default AppDetails;
