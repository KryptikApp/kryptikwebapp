import { NextPage } from "next";
import { UserDB } from "../src/models/user";
import { useKryptikAuthContext } from "./KryptikAuthProvider";

interface Props {
    photoPath:string
}
const AvatarMain:NextPage<Props> = (props) => {
    const{photoPath} = props;
    return(
        <div className="w-3/12 lg:w-2/12 px-4 mx-auto">
               {
                   photoPath==""?
                   <div className="shadow rounded-full max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1"/>:
                   <img src={photoPath} alt="Profile Image" className="shadow rounded-full max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1"/>
               }
          </div>
    )   
}

export default AvatarMain;