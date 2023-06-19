import { NextComponentType, NextPage } from "next";
import Image from "next/image";
import { Web3App } from "../../src/explore/apps/types";
import ListItemApp from "./ListItemApp";

interface Props {
  apps: Web3App[];
}

const ListApps: NextPage<Props> = (props: Props) => {
  const { apps } = { ...props };
  return (
    // show list of top apps
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <ListItemApp app={app} key={app.name} />
      ))}
    </div>
  );
};

export default ListApps;
