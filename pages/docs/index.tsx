import Link from 'next/link';
import Divider from '../../components/Divider';
import DocCategoryPreview from '../../components/docs/docCategoryPreview';
import { useKryptikThemeContext } from '../../components/ThemeProvider';
import { getAllDocs } from '../../src/helpers/docs';
import { DocType, DocTypeEnum } from '../../src/helpers/docs/types';


type Props = {
    allDocs: DocType[]
}

export default function DocsHome({allDocs}:Props){
  const {isDark} = useKryptikThemeContext();
  const essentialDocs = allDocs.filter(d=>d.category.toLowerCase()=="essentials");
  const web3BasicsDocs = allDocs.filter(d=>d.category.toLowerCase() =="web3 basics");
  const securityDocs = allDocs.filter(d=>d.category.toLowerCase() =="security");

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
                    <DocCategoryPreview docs={securityDocs} categoryName={'Security'} description={'Keep your wallet safe with best practices.'} flip={false}/>
                </div>
            </div>
            {/* supported token */}
            <div className="max-w-3xl mx-auto my-8">
            <Divider/>
                <p className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-sky-600">More Resources</p>
                <div className="flex flex-col space-y-8">
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
                    <Link href="../developer">
                        <div className="rounded-md border-l-4 border-green-500 px-2 py-4 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                            <h1 className="text-2xl text-left">
                            Developers
                            </h1>
                            <h2 className="text-lg text-gray-800 dark:text-gray-200">
                                Start contributing to essential wallet software.
                            </h2>
                        </div>
                    </Link>
                    <Link href="../blog">
                        <div className="rounded-md border-l-4 border-sky-400 px-2 py-4 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                            <h1 className="text-2xl text-left">
                            Blog
                            </h1>
                            <h2 className="text-lg text-gray-800 dark:text-gray-200">
                                Dive into the world of online privacy and ownership.
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
    const allDocs = getAllDocs({
        fields:[
        "slug",
        "title",
        "lastUpdate",
        "image",
        "oneLiner",
        "content",
        "category",
        "emoji"
    ], docEnum:DocTypeEnum.UserDoc})
  
    return {
      props: { allDocs },
    }
}
