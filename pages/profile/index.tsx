import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Splash.module.css'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { useEffect } from 'react'
import { useAuthContext } from '../../components/AuthProvider'
import { useRouter } from 'next/router'

const Profile: NextPage = () => {
  const { authUser, loading } = useAuthContext();
  const router = useRouter();

  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  return (
    <div>

     <div className="h-[6rem]">
              {/* padding div for space between top and main elements */}
      </div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
           <h2>Your Balances</h2>
           <div className="w-6/12 sm:w-4/12 px-4">
            <img src="https://www.creative-tim.com/learning-lab/tailwind-starter-kit/img/team-2-800x800.jpg" alt="..." className="shadow rounded-full max-w-full h-auto align-middle border-none" />
          </div>
        </div>

    </div>
 
  )
}

export default Profile