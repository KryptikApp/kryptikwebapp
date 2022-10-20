import Link from "next/link"
import { AiOutlineArrowLeft } from "react-icons/ai"
import Image from "next/image"

import { DocType } from "../../src/helpers/docs/types"


type Props = {
    doc:DocType
  }
  
const  BlogFeature = ({ doc}: Props) => {
    const urlBase = "/blog/[slug]"
    const urlAs = `/blog/${doc.slug}`
    return (
        <div className="max-w-3xl mx-auto">
        <div className="max-w-3xl rounded-lg bg-white text-black py-6 px-4 hover:outline hover:outline-2 outline-green-400">
            <div className='flex flex-col md:flex-row'>
                <div className="flex flex-col space-y-4">
                    <div className="">
                    <div className="flex flex-col space-y-2">
                        <p className="text-sky-500 text-lg font-semibold">{doc.category}</p>
                        <Link as={urlAs} href={urlBase}>
                            <p className='text-3xl font-bold hover:cursor-pointer'>{doc.title}</p>
                        </Link>
                        <div className="flex flex-row space-x-2">
                            {
                            doc.authorAvatar &&
                            <img className="w-12 h-12" src={doc.authorAvatar} />
                            }
                            <div className="flex flex-col">
                                <p className='text-md text-slate-800 font-semibold'>{doc.authorName}</p>
                                <p className='text-sm text-slate-600 font-semibold'>{doc.authorRole?doc.authorRole:""}</p>
                            </div>
                        </div>
                    </div>
                    </div>
                    <p className="text-lg text-gray-600">{doc.oneLiner}</p>
                    <Link as={urlAs} href={urlBase}>
                       <div className='hover:cursor-pointer'>
                            <p className="text-md text-sky-500 font-semibold">Read More &gt;</p>
                       </div> 
                    </Link>
                    
                </div>  
                {
                doc.image &&
                <Image width="600" height="600" className="object-cover" src={doc.image} />
                }
            </div>
            
        </div>
    </div>
    )
  }
  
  export default BlogFeature