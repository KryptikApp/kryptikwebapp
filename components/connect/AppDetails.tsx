import { NextPage } from "next";
import { removeHttp } from "../../src/helpers/utils";

type Props = {
  icon: string | undefined;
  name: string | undefined;
  description: string | undefined;
  url: string | undefined;
};

const AppDetails: NextPage<Props> = (props) => {
  const { icon, name, description, url } = { ...props };
  const urlToDisplay: string = url ? removeHttp(url) : "";
  return (
    <div className="w-max dark:text-white rounded-md flex flex-row space-x-2">
      <div>
        {icon && icon.length > 4 ? (
          <img className="h-14 w-14 rounded-full" src={icon}></img>
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-400 dark:bg-gray-500"></div>
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
