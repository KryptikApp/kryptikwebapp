import Link from "next/link";

type Props = {
  title: string;
  image?: string;
  oneLiner: string;
  slug: string;
  emoji?: string;
};

const DocPreview = ({ title, image, oneLiner, slug, emoji }: Props) => {
  const urlBase = "/docs/[slug]";
  const urlAs = `/docs/${slug}`;
  return (
    <Link as={urlAs} href={urlBase}>
      <div className="rounded-md px-2 py-4 hover:cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-900">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row space-x-2">
            {image != undefined && image != null ? (
              <img src={image} className="w-8 h-auto" />
            ) : (
              emoji && <p className="dark:text-white text-3xl">{emoji}</p>
            )}
            <h1 className="mt-1 text-xl font-semibold text-slate-700 dark:text-slate-200">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DocPreview;
