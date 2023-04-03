import Link from "next/link";
import Image from "next/image";

import { DocType } from "../../src/helpers/docs/types";

type Props = {
  doc: DocType;
};

const BlogFeature = ({ doc }: Props) => {
  const urlBase = "/blog/[slug]";
  const urlAs = `/blog/${doc.slug}`;
  return (
    <div className="max-w-3xl mx-auto">
      <div className="max-w-3xl rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white py-6 px-4 border border-1 border-slate-400 dark:border-slate-700 hover:border-2 hover:border-green-400 hover:dark:border-green-400">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col space-y-4">
            <div className="">
              <div className="flex flex-col space-y-2">
                <p className="text-sky-500 text-lg font-semibold">
                  {doc.category}
                </p>
                <Link as={urlAs} href={urlBase}>
                  <p className="text-3xl font-bold hover:cursor-pointer">
                    {doc.title}
                  </p>
                </Link>
                <div className="flex flex-row space-x-2">
                  {doc.contributor.avatarPath && (
                    <img
                      className="w-12 h-12"
                      src={doc.contributor.avatarPath}
                    />
                  )}
                  <div className="flex flex-col">
                    <p className="text-md text-slate-800 dark:text-slate-100 font-semibold">
                      {doc.contributor.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">
                      {doc.contributor.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 md:mr-1">
              {doc.oneLiner}
            </p>
            <Link as={urlAs} href={urlBase}>
              <div className="hover:cursor-pointer py-4 md:py-0">
                <p className="text-md text-sky-500 font-semibold">
                  Read More &gt;
                </p>
              </div>
            </Link>
          </div>
          {doc.image && (
            <Image
              alt="Blu Blog feature image."
              width="600"
              height="600"
              className="object-cover md:max-w-[50%] rounded-lg"
              src={doc.image}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogFeature;
