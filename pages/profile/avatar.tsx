import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getDownloadURL, ref, StorageReference, uploadBytes } from 'firebase/storage'


import { generateStoragePath, storage } from '../../src/helpers/firebaseHelper'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import { getFileName } from '../../src/helpers/utils'
import toast, { Toaster } from 'react-hot-toast'
import NavProfile from '../../components/navbars/NavProfile'
import { defaultUser } from '../../src/models/user'



const Profile: NextPage = () => {
  const { authUser, loadingAuthUser, getUserPhotoPath, updateCurrentUserKryptik } = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loadingAuthUser &&  (!authUser || !authUser.isLoggedIn))
      router.push('/')
  }, [authUser, loadingAuthUser])

  const imageUrlInit:string = getUserPhotoPath(authUser?authUser:defaultUser);
  const [imageUrl, setImageUrl] = useState(imageUrlInit);
  //UNCOMMENT for file uploads
  const [imageFile, setImageFile] = useState<Blob|null>(null);
  const [loadingUpdate, setloadingUpdate] = useState(false);

  // uploads file to device
  const uploadToClient = (event:any) => {
    if (event.target.files && event.target.files[0]) {
      // extract file from event
      const i:any = event.target.files[0];
      // save file data
      setImageFile(i);
      // set local image url for display
      setImageUrl(URL.createObjectURL(i));
    }
  };


  // gets file url from document reference
  const urlFromRef = async(storageRef:StorageReference):Promise<string>=>{
    let urlResult:string = await getDownloadURL(storageRef);
    return urlResult;
  }


  const uploadToRemote = async():Promise<string>=>{
    if(!authUser){
      toast.error("Please login before updating your preferences");
      return "";
  }
    console.log("firebase image upload starting....");
    let fileName:string = getFileName(imageUrl);
    let storageFilePath:string = generateStoragePath(fileName, authUser);
    const storageRef = ref(storage, storageFilePath);
    // placeholder for upload return url
    let imageUploadUrl:string = imageUrl;
    // upload file to db
    if(!imageFile){
      return "";
    }
    await uploadBytes(storageRef, imageFile);
    // get url for upload
    imageUploadUrl = await urlFromRef(storageRef);
    return imageUploadUrl;
  }


  const handleClickUpload = async() =>{
    if(!authUser){
      toast.error("Please login before updating your preferences");
      return;
    }
    try{
      setloadingUpdate(true);
      // don't upload if still in upload process
      if(loadingUpdate) return;
      // upload file to firebase
      let urlImageUpload:string = await uploadToRemote();
      authUser.photoUrl = urlImageUpload;
      // update user's profile photo
      await updateCurrentUserKryptik(authUser);
      setloadingUpdate(false);
      toast.success('Profile Updated!');
    }
    catch(e){
      toast.error("Error updating avatar. Please try again later.");
    }
  }

  return (
    <div>
    <Toaster/>
    <div className="h-[5vh]">
      {/* padding div for space between top and main elements */}
    </div>

    <div className="container flex md:flex-row flex-col space-y-10 spaxe-x-10 mx-auto place-items-center">
        <div className="w-full rounded">
          <img src={imageUrl} alt="image sneak peak" className="shadow rounded w-[300px] max-w-[90%] align-middle border-none" />
        </div>
        <div className="w-full rounded">
        <h5 className="mb-3 text-base font-bold text-black-900 lg:text-xl dark:text-white">
              Kryptik Avatar
          </h5>

                  <label className="form-label inline-block mb-2 text-gray-700 dark:text-gray-200">
                    Image Path</label>
                    <input className="form-control
                    block
                    w-full
                    px-3
                    py-1.5
                    text-base
                    font-normal
                    text-gray-700
                    bg-white bg-clip-padding
                    border border-solid border-gray-300
                    rounded
                    transition
                    hover:cursor-pointer
                    ease-in-out
                    m-0
                    focus:text-gray-700 focus:bg-white focus:border-sky-600 focus:outline-none dark:bg-[#141414]" type="file" id="file" name="file" onChange={uploadToClient} required/>         
                  
                  <p className="mt-2 text-slate-500 text-sm dark:text-slate-400">Your avatar will be shown to other Kryptik users. Square images work best.</p>
                    {/* upload button */}
                    <div className="item-end">
                      <button onClick={()=>handleClickUpload()} className={`bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 ${loadingUpdate?"hover:cursor-not-allowed":""} border border-green-500 hover:border-transparent rounded-lg my-5`} disabled={loadingUpdate}>
                        Upload
                        {
                                    !loadingUpdate?"":
                                    <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                    </svg>
                        }
                      </button>
                    </div>     
        </div>
    </div>
           
    <div className="h-[7rem]">
      {/* padding div for space between top and main elements */}
    </div>
    
<NavProfile/>
</div>
 
  )
}

export default Profile