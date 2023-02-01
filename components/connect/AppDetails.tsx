import { NextPage } from "next";

type Props = {
  icon: string | undefined;
  name: string | undefined;
  description: string | undefined;
};

const AppDetails: NextPage<Props> = (props) => {
  const { icon, name, description } = { ...props };
  return (
    <div className="w-max dark:text-white border border-gray-400 dark:border-gray-500 px-2 py-2 rounded-md flex flex-row space-x-2">
      <div>
        {icon && icon.length > 4 ? (
          <img className="h-10 w-10 rounded-full" src={icon}></img>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-500"></div>
        )}
      </div>
      <p className="my-auto text-lg">{name || "Unknown"}</p>
    </div>
  );
};

export default AppDetails;
