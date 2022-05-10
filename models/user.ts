 export interface UserDB {
        uid: string,
        email: string,
        name:string,
        photoUrl:string
}

export const defaultUser:UserDB = {
        uid: "",
        email:"",
        name: "",
        photoUrl: ""
}