import Link from "next/link"
import Image from "next/image"

import { DocType } from "../../src/helpers/docs/types"


type Props = {
    doc:DocType
    baseUrl:string
}
  
const RecentDocCard = ({ doc, baseUrl}: Props) => {
    const urlBase = `${baseUrl}[slug]`
    const urlAs = `${baseUrl}${doc.slug}`
    const formattedDate = new Date(doc.lastUpdate).toDateString();
    return (
        <div className="mx-auto w-full">
        <div className="rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white outline outline-1 outline-gray-500 hover:outline-green-400 min-h-[300px] md:min-h-[500px]">
            <div className='flex flex-col'>
                {
                doc.image &&
                <img className="object-cover w-[100%] h-[150px] rounded-t-lg" src={doc.image} />
                }
                <div className="flex flex-col space-y-4 px-4 pt-2 pb-6">
                    <div className="">
                    <div className="flex flex-col space-y-2">
                        <p className="text-sky-500 text-lg font-semibold">{doc.category}</p>
                        <Link as={urlAs} href={urlBase}>
                            <p className='text-3xl font-bold hover:cursor-pointer'>{doc.title}</p>
                        </Link>
                        <div>
                            <p className="text-gray-400 dark:text-gray-500 text-md">{formattedDate}</p>
                        </div>
                    </div>
                    </div>
                    <p className="text-md text-gray-600 dark:text-gray-300">{doc.oneLiner}</p>
                </div>  
            </div>  
        </div>
    </div>
    )
  }
  
  export default RecentDocCard