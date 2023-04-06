import Link from "next/link";
import { useEffect } from "react";
import { DocType } from "../../src/helpers/docs/types";
import { useKryptikThemeContext } from "../ThemeProvider";

type Props = {
  doc: DocType;
  baseUrl: string;
};

const DocListItemPreview = ({ doc, baseUrl }: Props) => {
  const { isDark } = useKryptikThemeContext();
  const { slug, title, lastUpdate } = { ...doc };
  const urlBase = `${baseUrl}[slug]`;
  const urlAs = `${baseUrl}${slug}`;
  const formattedDate = new Date(lastUpdate.replace(/-/g, "/")).toDateString();
  const listItemId = `${title}ListPreview`;
  const listItemTitleId = `${title}Title`;
  // useEffect(()=>{
  //     if(!document) return;
  //     const listItem = document.getElementById(listItemId);
  //     const listItemTitle = document.getElementById(listItemTitleId);
  //     if(listItem && listItemTitle){
  //         listItem.addEventListener("mouseenter", (e)=>{
  //             console.log("here")
  //             listItemTitle.style.color = "#3dde37"
  //         })
  //         listItem.addEventListener("mouseenter", (e)=>{
  //             // update to be same as default
  //             listItemTitle.style.color = isDark?"white":"black"
  //         })
  //     }
  // },[])
  return (
    <Link as={urlAs} href={urlBase}>
      <div
        id={listItemId}
        className="rounded-md px-2 py-4 hover:cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-900 text-slate-700 dark:text-slate-200"
      >
        <div className="flex flex-row space-x-2">
          <h1
            id={listItemTitleId}
            className="text-xl font-semibold hover:text-sky-400 hover:underline"
          >
            {title}
          </h1>
          <div className="flex-grow text-right">
            <p className="mt-1 text-sm my-auto text-slate-500 dark:text-slate-400">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DocListItemPreview;
