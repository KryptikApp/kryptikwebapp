import Link from "next/link"

type Props = {
    title: string
    image?: string
    oneLiner: string
    slug: string
    emoji?: string
  }
  
  const DocKeepReadingPreview = ({ title, image, oneLiner, slug, emoji }: Props) => {
    return (
    <Link as={`/docs/${slug}`} href="/docs/[slug]">
      <div className="rounded-md px-2 py-4 hover:cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-900 border border-gray-400 dark:border-gray-600">
        <div className="flex flex-col space-y-2">
                <div className="flex flex-row space-x-2">
                  {
                    image!=undefined && image!=null?
                    <img src={image} className="w-8 h-auto"/>:
                    emoji&&
                    <p className="dark:text-white text-3xl">{emoji}</p>
                  }
                    <h1 className="mt-1 text-xl font-semibold text-slate-700 dark:text-slate-200">{title}</h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-slate-400">{oneLiner}</p>
        </div>
      </div>
      </Link>
    )
  }
  
  export default DocKeepReadingPreview