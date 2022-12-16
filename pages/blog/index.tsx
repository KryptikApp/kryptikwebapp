import Link from "next/link";
import Divider from "../../components/Divider";
import DocCategoryPreview from "../../components/docs/docCategoryPreview";
import Image from "next/image";

import { getAllDocs } from "../../src/helpers/docs";
import { DocType, DocTypeEnum } from "../../src/helpers/docs/types";
import BlogFeature from "../../components/docs/blogFeature";
import RecentDocCard from "../../components/docs/recentDocCard";
import Head from "next/head";
import { useState } from "react";
import DocListItemPreview from "../../components/docs/docListItemPreview";
import { AiOutlineSearch } from "react-icons/ai";

type Props = {
  allDocs: DocType[];
};

export default function BlogHome({ allDocs }: Props) {
  const [showAll, setShowAll] = useState(true);
  // get the most recent blog post
  const mostRecentDoc: DocType = allDocs[0];
  // most recent docs that aren't the last posted doc
  const freshDocs: DocType[] = allDocs.slice(1, 4);
  const baseBlogUrl = "/blog/";

  const [query, setQuery] = useState("");
  const [filteredDocs, setFilteredDocs] = useState<DocType[]>(allDocs);

  function searchArticles(q: string) {
    // filter on title and tags
    const newResults: DocType[] = allDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.tags?.find((d) => d.toLowerCase().includes(q))
    );
    // update state
    setFilteredDocs(newResults);
  }

  function handleQueryChange(newQuery: string) {
    // update state
    setQuery(newQuery);
    // get suggestions
    searchArticles(newQuery);
  }

  return (
    <div className="">
      <Head>
        <title>Kryptik Blog</title>
        <meta name="description" content="A blog on privacy and ownership." />
      </Head>
      <div className="">
        <div className="dark:text-white">
          <div className="max-w-3xl mx-auto mb-[5vh] md:mb-[10vh] text-left">
            <p className="text-sky-400 text-lg mt-2 ml-2 mb-4 font-semibold">
              Blog
            </p>
          </div>

          <BlogFeature doc={mostRecentDoc} />

          <div className="max-w-3xl mx-auto">
            <p className="text-sky-400 text-lg mt-10 mb-4 font-semibold">
              Recent Thoughts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-8">
              {freshDocs.map((doc: DocType, index: number) => (
                <RecentDocCard doc={doc} baseUrl={baseBlogUrl} key={index} />
              ))}
            </div>
            {/* searchbar */}
            <div className="my-10 rounded-lg bg-gray-100 dark:bg-gray-900 border border-slate-200 hover:border-green-400 text-black dark-text-gray">
              <div className="flex flex-row space-x-1">
                <div className="my-auto font-semibold pl-2">
                  <AiOutlineSearch
                    size={24}
                    className="text-black dark:text-white"
                  />
                </div>

                <input
                  type="search"
                  autoComplete="off"
                  id="search-articles"
                  className="p-4 flex-grow text-gray-900 text-lg bg-inherit dark:placeholder-gray-400 dark:text-white font-bold outline-none"
                  placeholder={`Search Articles`}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-2" onClick={() => setShowAll(!showAll)}>
              {showAll ? (
                <p className="text-sky-400 text-right text-lg mt-4 font-semibold hover:cursor-pointer">
                  Hide All
                </p>
              ) : (
                <p className="text-sky-400 text-right text-lg mt-4 font-semibold hover:cursor-pointer">
                  See All
                </p>
              )}
            </div>
            {showAll && (
              <div className="grid grid-cols-1 gap-y-2">
                {filteredDocs.map((doc: DocType, index: number) => (
                  <DocListItemPreview
                    doc={doc}
                    key={index}
                    baseUrl={"/blog/"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-[6rem]">
          {/* padding div for space between bottom and main elements */}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps = async () => {
  const allDocs = getAllDocs({
    docEnum: DocTypeEnum.Blog,
  });

  return {
    props: { allDocs },
  };
};
