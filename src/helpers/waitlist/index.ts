
import { setDoc, doc, collection, query, getDocs, orderBy, getDoc } from "firebase/firestore";
import { firestore } from "../firebaseHelper";
import { isValidEmailAddress } from "../resolvers/kryptikResolver";

export interface IWaitlistData{
    timeAdded: number
}

const WaitlistDbRef = collection(firestore, "waitlist");

export const addEmailToWaitlist = async function(newEmail:string, errorHandler:(msg:string)=>void):Promise<number|null>{
    let isAlreadyAdded: boolean = await isEmailInWaitlist(newEmail);
    if(!isValidEmailAddress(newEmail)) errorHandler(`${newEmail} is not a valid email.`);
    if(isAlreadyAdded) 
    {
        let position:number|null = await getWaitlistPosition(newEmail);
        return position;
        // errorHandler("You're already on the waitlist. We're glad you're excited to join Kryptik!");
    }
    // add to waitlist on remote db
    let waitlistData:IWaitlistData = {
        timeAdded: Date.now()
    }
    await setDoc(doc(firestore, "waitlist", newEmail.toLowerCase()), waitlistData);
    let position:number|null = await getWaitlistPosition(newEmail);
    return position;
}

// returns waitlist position for email.. if email is not in waitlist it returns null
export const getWaitlistPosition = async function(newEmail:string):Promise<number|null>{
    const q = query(WaitlistDbRef, orderBy("timeAdded", "asc"));
    const querySnapshot = await getDocs(q);
    let position:number = 1;
    for(const docdata of querySnapshot.docs){
        let docKey:string = docdata.id;
        // if key matches email return position
        if(docKey.toLowerCase() == newEmail.toLowerCase()){
            return position;
        }
        position = position + 1;
    }
    // if no match return null
    return null;
}


// returns true if email is lready in waitlist.. otherwise false
export const isEmailInWaitlist = async function(email:string):Promise<boolean>{
    const docRef = doc(firestore, "waitlist", email.toLowerCase());
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()) return true;
    return false;
}

export const isOnAlphaTestList = async function(email:string):Promise<boolean>{
    const docRef = doc(firestore, "alphaTesters", email.toLowerCase());
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()) return true;
    return false;
}