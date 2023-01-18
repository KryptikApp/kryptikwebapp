import { NextPage } from "next";
import { ColorEnum } from "../../src/helpers/utils";
import Button from "../buttons/Button";
import Divider from "../Divider";

type Props = {
  icon?: string;
  name?: string;
  url?: string;
  description?: string;
  onDelete?: () => any;
};

const PairingCard: NextPage<Props> = (props) => {
  const { icon, name, url, description } = { ...props };
  return (
    <div className="w-max dark:text-white border border-gray-400 dark:border-gray-500 px-2 py-2 rounded-md flex flex-row space-x-2">
      <a
        href={`${url ? url : "#"}`}
        className="hover:cursor-pointer hover:text-sky-500 text-sky-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div>
          {icon && icon.length > 4 ? (
            <img className="h-10 w-10 rounded-full" src={icon}></img>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-500"></div>
          )}
        </div>
        <p className="my-auto text-lg">{name || "Unknown"}</p>
      </a>
    </div>
  );
};

export default PairingCard;
