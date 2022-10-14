import Link from 'next/link';
import Divider from '../../components/Divider';
import DocCategoryPreview from '../../components/docs/docCategoryPreview';
import Image from "next/image"

import { useKryptikThemeContext } from '../../components/ThemeProvider';
import { getAllDocs } from '../../src/helpers/docs';
import { DocType, DocTypeEnum } from '../../src/helpers/docs/types';
import BlogFeature from '../../components/docs/blogFeature';


type Props = {
    allDocs: DocType[]
}

export default function BlogHome({allDocs}:Props){
  const {isDark} = useKryptikThemeContext();
  // get the most recent blog post
  const mostRecentDoc:DocType = allDocs.reverse()[0];

  return (

    <div className="min-h-[90vh] max-w-[100vw] -mx-4 bg-gradient-to-b from-black to-sky-800 bg-gradient-to-r">
        <div className="mx-4">
            <div className="dark:text-white">
            <div className="max-w-3xl mx-auto mb-[10vh] text-left">
                <p className="text-sky-400 text-lg mb-4 font-semibold">Blog</p> 
                </div>

                <BlogFeature doc={mostRecentDoc}/>
               
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
        fields:[
        "slug",
        "title",
        "lastUpdate",
        "image",
        "oneLiner",
        "content",
        "category",
        "emoji",
        "tags",
        "authorName",
        "authorAvatar",
        "authorRole"
    ], docEnum:DocTypeEnum.Blog})
  
    return {
      props: { allDocs },
    }
}
