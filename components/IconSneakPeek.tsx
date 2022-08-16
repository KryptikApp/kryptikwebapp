import { NextPage } from "next";

interface Props{
    icons:string[],
    // how many there are... plus hidden 
    groupTotal:number
}
const IconSneakPeek:NextPage<Props> = (props) => {
    const{icons, groupTotal} = {...props}
    return(
        <div className="flex flex-row">
        <div className="flex flex-row">
            {
                icons.map((icon:string, index:number) => (
                    <img className="rounded-full w-8 h-8 -ml-2 font-semibold" src={icon} key={index}/>
                ))
            }
        </div>
        <p className="text-gray-700 dark:text-gray-200">+{groupTotal-icons.length}</p>
        </div>
    )   
}

export default IconSneakPeek;