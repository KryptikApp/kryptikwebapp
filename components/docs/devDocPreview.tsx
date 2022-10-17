import Link from "next/link"
import { Router, useRouter } from "next/router"

type Props = {
    title: string
    image?: string
    oneLiner: string
    slug: string
    emoji?: string
    activeSlug?: string
    onSelection?: (slug:string)=>void
  }
  
  const DocPreview = ({ title, image, oneLiner, slug, emoji, activeSlug, onSelection}: Props) => {
    const router = useRouter();
    const urlBase = "/developer/[slug]"
    const urlAs = `/developer/${slug}`
    function handleSelection(){
        if(onSelection){
          onSelection(slug);
        }
        // navigate to new page
        router.push(urlBase, urlAs);
    }
    return (
    <div onClick={()=>handleSelection()}>
      <div className="rounded-md px-2 py-1 hover:cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-900">
        <div className="flex flex-col space-y-2">
                <div className="flex flex-row space-x-2">
                  {
                    image!=undefined && image!=null?
                    <img src={image} className="w-6 h-auto"/>:
                    emoji&&
                    <p className="dark:text-white text-3xl">{emoji}</p>
                  }
                    <h1 className={`mt-1 text-sm font-semibold ${activeSlug && activeSlug ==slug?"text-sky-400":"text-slate-700 dark:text-slate-200"}`}>{title}</h1>
                </div>
        </div>
      </div>
      </div>
    )
  }
  
  export default DocPreview