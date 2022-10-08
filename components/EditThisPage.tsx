import { NextPage } from "next";
import Image from 'next/image'

interface Props{
    link:string
}
const EditThisPage:NextPage<Props> = (props) => {
    const{link} = {...props}
    return(
            <a className="hover:cursor-pointer hover:text-sky-500 text-sky-400 flex flex-row space-x-2 my-4 text-xl font-semibold" href={link} target="_blank" rel="noopener noreferrer">
                <Image src="/media/partners/githubLogo.png" width="28" height="28" className="my-auto"/>
                <p>Edit this Page</p>
            </a>
    )   
}

export default EditThisPage;