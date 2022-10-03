import Link from "next/link"
import { DocType } from "../../src/helpers/docs/types"
import DocPreview from "./docPreview"

type Props = {
    categoryName: string,
    description: string,
    docs: DocType[],
    flip?:boolean
  }
  
  const DocCategoryPreview = ({ categoryName, docs, description, flip }: Props) => {
    // default flip to false
    if(flip==undefined){
        flip = false;
    }
    return (
        <div>
                    {/* <div className={`flex flex-col space-y-4 lg:space-y-0 lg:space-x-4 ${flip?"lg:flex-row-reverse":"lg:flex-row"}`}> */}
                    <div className={`flex flex-col space-y-4 lg:space-y-0 lg:space-x-4 lg:flex-row`}>
                        <div className="lg:w-[50%] lg:my-auto">   
                            <div className={`px-2`}>
                                <h2 className="text-2xl font-bold">
                                    {categoryName}
                                </h2>
                                <h2 className="text-lg text-gray-800 dark:text-gray-200">
                                    {description}
                                </h2>
                            </div>
                        </div>
                        <div className="lg:w-[50%]">
                            <div className="rounded-md border border-gray-500 hover:border-sky-400 px-2 py-4">
                            {   
                                docs.map((doc:DocType, index:number)=>
                                <DocPreview emoji={doc.emoji||undefined} title={doc.title} slug={doc.slug} oneLiner={doc.oneLiner} image={doc.image||undefined} key={"essentials"+index}/>
                                )
                            }
                            </div>
                        </div>
                    </div>
            </div>
    )
  }
  
  export default DocCategoryPreview