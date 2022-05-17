import { NextPage } from "next";
import { getUserPhotoPath } from "../src/helpers/firebaseHelper";
import { UserDB } from "../src/models/user";
import AvatarMain from "./AvatarMain";

interface Props {
    user:UserDB
}

const HeaderProfile:NextPage<Props> = (props) => {
    const{user} = props;
    return(
        <div>
            <AvatarMain photoPath={getUserPhotoPath(user)}/>
            <h1 className="mt-3 font-bold">{user.name}</h1>
        </div>  
    )   
}

export default HeaderProfile;