import { useRouter } from "next/router";
import {
  getAllDocs,
  getDocBySlug,
  getDocsByCategory,
} from "../../src/helpers/docs";
import markdownToHtml from "../../src/helpers/docs/markdownFormat";
import Custom404 from "../404";
import { DocType, DocTypeEnum } from "../../src/helpers/docs/types";
import DocHeader from "../../components/docs/docHeader";
import DocContent from "../../components/docs/docContent";
import DocKeepReadingPreview from "../../components/docs/docKeepReadingPreview";
import EditThisPage from "../../components/EditThisPage";
import { sampleSize } from "lodash";

type Props = {
  doc: DocType;
  recommendedDocs?: DocType[];
};

export default function Post({ doc, recommendedDocs }: Props) {
  const router = useRouter();
  // TODO: 2x check to make sure we correctly set 404
  if (!router.isFallback && !doc?.slug) {
    console.warn(`Unable to find this doc!`);
    return <Custom404 />;
  }
  const githubLink: string = `https://github.com/KryptikApp/kryptikwebapp/blob/main/developerDocs/${doc.slug}.md`;
  let readNext: DocType[] = recommendedDocs ? recommendedDocs : [];
  return (
    <div className="md:max-h-[92vh] md:overflow-y-auto pt-10">
      {router.isFallback ? (
        <h1 className="text-2xl text-black dark:text-white">Loading....</h1>
      ) : (
        <div>
          <DocHeader
            title={doc.title}
            image={doc.image || undefined}
            lastUpdated={doc.lastUpdate}
            emoji={doc.emoji || undefined}
            hideBackButton={true}
          />
          <DocContent content={doc.content} />
          {readNext.length != 0 && (
            <div className="max-w-3xl mx-auto my-8">
              <hr className="mt-2" />
              <div className="mt-6 mb-8">
                <h1 className="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-600 text-left">
                  Keep Learning
                </h1>
                <p className="text-md text-gray-700 dark:text-gray-200">
                  Explore more ideas from the frontier of online ownership.
                </p>
              </div>
              <div className="flex flex-col space-y-4">
                {readNext.map((doc: DocType, index: number) => (
                  <DocKeepReadingPreview
                    baseUrl="/developer/"
                    key={`keep reading preview ${index}`}
                    title={doc.title}
                    image={doc.image || undefined}
                    emoji={doc.emoji || undefined}
                    oneLiner={doc.oneLiner}
                    slug={doc.slug}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* edit this page */}
      <div className="max-w-3xl mx-auto my-8">
        <EditThisPage link={githubLink} />
      </div>
      <div className="h-[24vh]">
        {/* padding div for space between top and main elements */}
      </div>
    </div>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  let newDoc: DocType = getDocBySlug({
    slug: params.slug,
    docEnum: DocTypeEnum.DevDoc,
  });
  // create html from markdown content
  const content: string = await markdownToHtml(newDoc.content || "");
  newDoc.content = content;
  let newRecommendedDocs: DocType[] = getDocsByCategory({
    category: newDoc.category,
    slugToExclude: newDoc.slug,
    docEnum: DocTypeEnum.DevDoc,
  });
  // cap number of recommended docs at 3
  // randomly choose 3 docs
  if (newRecommendedDocs.length > 3) {
    newRecommendedDocs = sampleSize(newRecommendedDocs, 3);
  }
  return {
    props: {
      doc: newDoc,
      recommendedDocs: newRecommendedDocs,
    },
  };
}

export async function getStaticPaths() {
  const docs = getAllDocs({ fields: ["slug"], docEnum: DocTypeEnum.DevDoc });

  return {
    paths: docs.map((doc) => {
      return {
        params: {
          slug: doc.slug,
        },
      };
    }),
    fallback: false,
  };
}
