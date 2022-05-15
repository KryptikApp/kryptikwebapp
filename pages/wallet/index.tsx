import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import ListBalance from '../../components/lists/ListBalance'
import Link from 'next/link'

const Profile: NextPage = () => {
  const { authUser, loading, kryptikWallet, kryptikService } = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])


  return (
    <div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
           <div className="w-3/12 lg:w-2/12 px-4 mx-auto">
            <img src="https://www.creative-tim.com/learning-lab/tailwind-starter-kit/img/team-2-800x800.jpg" alt="Profile Image" className="shadow rounded-full max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1" />
          </div>
          <h2>Your Balances</h2>
          <Divider/>
          <ListBalance/>
          <Link href="../profile/manage"><span className={`p-2 lg:px-4 md:mx-2 text-gray-400 rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 transition-colors duration-300 ${router.pathname == "/about" ? "font-bold" : ""} `}>Manage Profile</span></Link>
        </div>

    </div>
 
  )
}

export default Profile