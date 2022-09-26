import { useRouter } from "next/router"
import { getAllDocs, getDocBySlug } from "../../src/helpers/docs"
import markdownToHtml from "../../src/helpers/docs/markdownFormat"
import Custom404 from "../404"
import { DocType } from "../../src/helpers/docs/types"
import DocHeader from "../../components/docs/docHeader"
import DocContent from "../../components/docs/docContent"

type Props = {
    doc: DocType
}

export default function Post({ doc }: Props) {
    const router = useRouter()
    // TODO: 2x check to make sure we correctly set 404
    if (!router.isFallback && !doc?.slug) {
      console.warn(`Unable to find this doc!`)
      return <Custom404/>;
    }
    return (
          <div>
            <div className="max-w-2xl mx-auto">
                {
                router.isFallback?
                <h1 className="text-2xl text-black dark:text-white">Loading....</h1>
                :
                <div>
                    <DocHeader title={doc.title} image={doc.image} lastUpdated={doc.lastUpdate} emoji={doc.emoji}/>
                    <DocContent content={doc.content}/>
                </div>
                }
            </div>
            <div className="h-[24vh]">
              {/* padding div for space between top and main elements */}
            </div>
          </div>
    )
  }
  
  type Params = {
    params: {
      slug: string
    }
  }
  
  export async function getStaticProps({ params }: Params) {
    const doc = getDocBySlug(params.slug, [
        "slug",
        "title",
        "lastUpdate",
        "image",
        "oneLiner",
        "content",
        "category",
        "emoji"
    ])
    const content = await markdownToHtml(doc.content || '')
    return {
      props: {
        doc: {
          ...doc,
          content,
        },
      },
    }
  }
  
  export async function getStaticPaths() {
    const docs = getAllDocs(['slug'])
  
    return {
      paths: docs.map((doc) => {
        return {
          params: {
            slug: doc.slug,
          },
        }
      }),
      fallback: false,
    }
  }