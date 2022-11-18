import { NextPage } from "next";

interface Props {
    photoPath:string
}
const AvatarMain:NextPage<Props> = (props) => {
    const{photoPath} = props;
    return(
        <div className="w-3/12 lg:w-2/12 px-4 mx-auto">
               {
                   photoPath==""?
                   <div className="shadow rounded-full bg-sky-600 max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1"/>:
                   <img src={photoPath} alt="Profile Image" className="object-cover rounded-full max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1"/>
               }
        </div>
    )   
}

export default AvatarMain;