import { NextPage } from "next";
import { getUserPhotoPath } from "../src/helpers/firebaseHelper";
import { UserDB } from "../src/models/user";
import AvatarMain from "./AvatarMain";

interface Props {
    user:UserDB,
    center:boolean,
    showBio:boolean
}

const HeaderProfile:NextPage<Props> = (props) => {
    const{user, center, showBio} = props;
    return(
        <div>
            {
                center?
                <div>
                    <AvatarMain photoPath={getUserPhotoPath(user)}/>
                    <h1 className="mt-3 font-bold">{user.name}</h1>
                    {
                        showBio && <p className="text-slate-500 text-sm">{user.bio}</p>
                    }
                </div>
                :
                <div className="flex px-4 pt-12">
                    <AvatarMain photoPath={getUserPhotoPath(user)}/>
                    <div className="w-9/12 flex items-center">
                        <div className="w-10/12 flex flex-col leading-none items-start">
                            <h1 className="mt-3 font-bold hover:text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-green-500">{user.name}</h1>
                            {
                                showBio && <p className="text-slate-500 text-sm">{user.bio}</p>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>

        


    )   
}

export default HeaderProfile;