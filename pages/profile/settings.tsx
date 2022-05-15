import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import NavProfile from '../../components/NavProfile'


const Settings: NextPage = () => {
  const { authUser, loading, getUserPhotoPath, signOut } = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(()=>{
    getUserPhotoPath(authUser).then((path)=>{
        setPhotoUrl(path);
    })
  });

  const handleLogout = function(){
    signOut();
  }

  return (
    <div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
           <div className="w-3/12 lg:w-2/12 px-4 mx-auto">
               {
                   photoUrl==""?
                   <div className="shadow rounded-full max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1"/>:
                   <img src={photoUrl} alt="Profile Image" className="shadow rounded-full max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1"/>
               }
          </div>
          <Divider/>
          <button onClick={()=>handleLogout()} className="bg-transparent hover:bg-red-500 text-black-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded my-5">
                            Logout
          </button>
        </div>

        
    <NavProfile/>
    </div>
 
  )
}

export default Settings