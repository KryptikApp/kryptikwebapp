 export interface UserDB {
        uid: string,
        email: string,
        name:string,
        bio: string,
        photoUrl:string
        isAdvanced:boolean
        isLoggedIn:boolean
}

export const defaultUser:UserDB = {
        uid: "",
        email:"",
        name: "",
        bio: "",
        photoUrl: "",
        isAdvanced: false,
        isLoggedIn:false 
}

// interface for extra user data
export interface UserExtraData{
        isTwoFactorAuth: boolean,
        remoteShare: string,
        bio:string
}