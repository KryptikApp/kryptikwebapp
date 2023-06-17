import { NextComponentType, NextPage } from "next";
import Image from "next/image";
import { Web3App } from "../../src/explore/apps/types";

interface Props {
  app: Web3App;
}

const ListItemApp: NextPage<Props> = (props: Props) => {
  const { app } = { ...props };
  return (
    // show simple preview of app with name, description, tags, and image
    <a href={app.url} target="_blank" rel="noopener noreferrer">
      <div className="flex flex-col justify-center w-full h-full bg-white rounded-lg shadow-md dark:bg-gray-800/10 py-1 border border-gray-400/10 hover:border-green-400/20 transform-color duration-300">
        <div className="w-full">
          <Image
            className="float-left pl-2"
            src={app.icon}
            alt={`${app.name} image`}
            width={30}
            height={30}
          />
        </div>
        <div className="flex flex-col px-2 w-full">
          <h1 className="text-lg font-semibold text-left text-gray-800 dark:text-white">
            {app.name}
          </h1>
          <p className="text-left text-gray-500 dark:text-gray-400">
            {app.description}
          </p>
          <div className="flex flex-row flex-wrap justify-right space-x-2">
            {app.tags.map((tag) => (
              <div
                key={tag}
                className="px-2 py-1 mt-2 text-sm text-gray-700 bg-gray-200/20 rounded-md dark:bg-gray-700/20 dark:text-gray-400"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
};

export default ListItemApp;
