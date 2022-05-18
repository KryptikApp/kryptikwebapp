import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import NavProfile from '../../components/NavProfile'


const Profile: NextPage = () => {
  const {authUser, loading} = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])


  return (
    <div>
      
        <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
        </div>

        <div className="lg:px-[30%]">
        <h1 className="text-4xl font-bold sans mb-5">
                Security
        </h1>
        <p className="leading-loose mb-2 text-justify">Kryptik improves wallet security by encrypting a serialized wallet on the client and 
        splitting the encryption key between local storage and the server via shamir secret sharing. </p>
        </div>

    <div className="h-[7rem]">
      {/* padding div for space between top and main elements */}
    </div>
    <NavProfile/>
    </div>
 
  )
}

export default Profile