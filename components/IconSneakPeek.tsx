import { NextPage } from "next";

interface Props{
    icons:string[],
    // how many there are... plus hidden 
    groupTotal:number
}
const IconSneakPeek:NextPage<Props> = (props) => {
    const{icons, groupTotal} = {...props}
    const excludedTotal = groupTotal-icons.length;
    return(
        <div className="flex flex-row">
        <div className="flex flex-row">
            {
                icons.map((icon:string, index:number) => (
                    <img className={`rounded-full w-8 h-8 ${icons.length>1 && "-ml-2"} font-semibold`} src={icon} key={index}/>
                ))
            }
        </div>
        {
            excludedTotal>0 && 
            <p className="text-gray-700 dark:text-gray-200">+{excludedTotal}</p>
        }
        </div>
    )   
}

export default IconSneakPeek;