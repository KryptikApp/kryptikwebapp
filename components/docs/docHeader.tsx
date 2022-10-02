import Link from "next/link"
import { AiOutlineArrowLeft } from "react-icons/ai"
import DateFormatter from "../time/DateFormatter"

type Props = {
    title: string
    image?: string
    emoji?: string
    lastUpdated: string
  }
  
  const DocHeader = ({ title, image, lastUpdated, emoji}: Props) => {
    return (
      <div className="flex flex-col space-y-4">
            <Link href={"./"}><AiOutlineArrowLeft size={24} className="text-slate-300 dark:text-slate-600 hover:cursor-pointer mb-2 hover:text-sky-400 hover:dark:text-sky-400"/></Link>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              {
                image!=undefined?
                <img src={image} width="40"/>:
                emoji &&
                <p className="text-3xl dark:text-white">{emoji}</p>
              }
                
                <h1 className="text-black dark:text-white text-4xl font-bold">{title}</h1>
            </div>
            <DateFormatter dateString={lastUpdated}/>
      </div>
    )
  }
  
  export default DocHeader