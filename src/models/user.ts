 export interface UserDB {
        uid: string,
        email: string,
        name:string,
        bio: string,
        photoUrl:string
}

export const defaultUser:UserDB = {
        uid: "",
        email:"",
        name: "",
        bio: "",
        photoUrl: ""
}

// interface for extra user data
export interface UserExtraData{
        isTwoFactorAuth: boolean,
        remoteShare: string,
        bio:string
}