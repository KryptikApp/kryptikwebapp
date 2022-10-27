import Link from 'next/link';
import Divider from '../../components/Divider';
import DocCategoryPreview from '../../components/docs/docCategoryPreview';
import Image from "next/image"

import { getAllDocs } from '../../src/helpers/docs';
import { DocType, DocTypeEnum } from '../../src/helpers/docs/types';
import BlogFeature from '../../components/docs/blogFeature';
import RecentDocCard from '../../components/docs/recentDocCard';
import Head from 'next/head';
import { useState } from 'react';
import DocListItemPreview from '../../components/docs/docListItemPreview';


type Props = {
    allDocs: DocType[]
}

export default function BlogHome({allDocs}:Props){
  const [showAll, setShowAll] = useState(false)
  // get the most recent blog post
  const mostRecentDoc:DocType = allDocs[0];
  // most recent docs that aren't the last posted doc
  const freshDocs:DocType[]  = allDocs.slice(1, 4)
  const baseBlogUrl = "/blog/"

  return (

    <div className="">
       <Head>
          <title>Kryptik Blog</title>
          <meta name="description" content="A blog on privacy and ownership." />
        </Head>
        <div className="">
            <div className="dark:text-white">
            <div className="max-w-3xl mx-auto mb-[5vh] md:mb-[10vh] text-left">
                <p className="text-sky-400 text-lg mt-2 ml-2 mb-4 font-semibold">Blog</p> 
            </div>

                <BlogFeature doc={mostRecentDoc}/>

                <div className="max-w-3xl mx-auto">
                  <p className="text-sky-400 text-lg mt-10 mb-4 font-semibold">Recent Thoughts</p> 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-8">
                    {
                      freshDocs.map((doc:DocType, index:number)=>
                      <RecentDocCard doc={doc} baseUrl={baseBlogUrl} key={index}/>
                      )
                    }
                  </div>
                  <div className="mb-2" onClick={()=>setShowAll(!showAll)}>
                    {
                      showAll?
                      <p className="text-sky-400 text-right text-lg mt-4 font-semibold hover:cursor-pointer">Hide All</p>:
                      <p className="text-sky-400 text-right text-lg mt-4 font-semibold hover:cursor-pointer">See All</p>
                    }
                  </div>
                    {
                      showAll &&
                      <div className="grid grid-cols-1 gap-y-2">
                         {
                            allDocs.map((doc:DocType, index:number)=>
                            <DocListItemPreview baseUrl={baseBlogUrl} doc={doc} key={index}/>
                            )
                          }
                      </div>
                    }
                    
                
                  
                </div>
                
            </div>

            <div className="h-[6rem]">
            {/* padding div for space between bottom and main elements */}
            </div>
        </div>
        

    </div>
       

 
  )
}

export const getStaticProps = async () => {
    const allDocs = getAllDocs({
        docEnum:DocTypeEnum.Blog})
  
    return {
      props: { allDocs },
    }
}
