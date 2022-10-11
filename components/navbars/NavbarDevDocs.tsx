import { useEffect, useState } from "react";

import { DocType } from "../../src/helpers/docs/types";
import { KryptikFetch } from "../../src/kryptikFetch";
import DocDevCategoryPreview from "../docs/docDevCategoryPreview";


  

export default function NavbarDevDocs(){
    const [showMenu, setShowMenu] = useState(false);
    const [allDocs, setAllDocs] = useState<DocType[]>([]);


    async function fetchDevDocs(){
        let docsResponse = await KryptikFetch('/api/devDocs', {method:"POST", timeout:8000, headers:{'Content-Type': 'application/json',}})
        if(docsResponse.status != 200) return;
        const newDevDocs = docsResponse.data.devDocs;
        if(newDevDocs){
            setAllDocs(newDevDocs);
        }
    }


    useEffect(() => {
        fetchDevDocs()
      }, [])


        
    return(
        <nav className="">
            <button id="nav-icon" onClick={()=>setShowMenu(!showMenu)} type="button" className={`inline-flex ${showMenu && "open"} items-center mt-2 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600`} aria-controls="mobile-menu" aria-expanded="false">
                <span className="bg-gray-500 dark:bg-gray-400"></span>
                <span className="bg-gray-500 dark:bg-gray-400"></span>
                <span className="bg-gray-500 dark:bg-gray-400"></span>
            </button>
            {/* note: height is dependent on layout top bar */}
            <div className={`${!showMenu && "hidden"} flex-col md:flex px-8 md:py-4 h-[92vh] md:w-[18vw] md:min-w-[250px] md:border-r-2 border-gray-200 dark:border-gray-800 text-black dark:text-white`}>
                
                <div className="flex flex-col">
                    {
                        allDocs.length != 0 &&
                        <DocDevCategoryPreview alwaysOpen={true} docs={allDocs.filter(d=>d.category.toLowerCase()=="getting started")} categoryName="Getting Started" description="Essential knowledge to get started."/>
                    }
                </div>

            </div>
        </nav>
    )
    
}