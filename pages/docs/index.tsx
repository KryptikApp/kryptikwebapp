import Link from 'next/link';
import DocCategoryPreview from '../../components/docs/docCategoryPreview';
import { useKryptikThemeContext } from '../../components/ThemeProvider';
import { getAllDocs } from '../../src/helpers/docs';
import { DocType } from '../../src/helpers/docs/types';


type Props = {
    allDocs: DocType[]
}

export default function DocsHome({allDocs}:Props){
  const {isDark} = useKryptikThemeContext();
  const essentialDocs = allDocs.filter(d=>d.category=="essentials");
  const web3BasicsDocs = allDocs.filter(d=>d.category=="web3 basics");

  return (

    <div>
        <div className="dark:text-white graphPaper2">
            <div className="max-w-2xl mx-auto mb-8">
                <div className="mb-4 rounded-lg bg-gray-100 dark:bg-gray-900 border border-sky-400 hover:shadow-md hover:shadow-sky-400 px-2 py-4 ">
                    <div className="flex flex-row space-x-1">
                        <p className="text-6xl pt-2">📜</p>
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-3xl text-left font-bold sans">
                                    Docs &amp; Threads
                            </h1>
                            <p className="leading-loose text-xl text-justify dark:text-gray-400">A collection of helpful how-tos</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* categories and article previews */}
            <div className="max-w-3xl mx-auto">
                <div className='flex flex-col space-y-8'>
                    <DocCategoryPreview docs={essentialDocs} categoryName={'The Essentials'} description={'Create your first wallet and start exploring the decentralized web.'} flip={false}/>
                    <DocCategoryPreview docs={web3BasicsDocs} categoryName={'Web3 Basics'} description={'Learn more about decentralized networks and emerging applications.'} flip={true}/>
                </div>
            </div>
            {/* supported token */}
            <div className="max-w-3xl mx-auto my-8">
                <div className="flex flex-col lg:flex-row">
                    <Link href="../support/supportedProtocols">
                        <div className="rounded-md border-l-4 border-sky-400 px-2 py-4 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                            <h1 className="text-2xl text-left">
                            Asset Finder
                            </h1>
                            <h2 className="text-lg text-gray-800 dark:text-gray-200">
                                Learn about what tokens Kryptik supports.
                            </h2>
                        </div>
                    </Link>
                    
                </div>
            </div>
        </div>


        <div className="h-[6rem]">
          {/* padding div for space between bottom and main elements */}
        </div>

    </div>
       

 
  )
}

export const getStaticProps = async () => {
    const allDocs = getAllDocs([
        "slug",
        "title",
        "lastUpdate",
        "image",
        "oneLiner",
        "content",
        "category",
        "emoji"
    ])
  
    return {
      props: { allDocs },
    }
}
