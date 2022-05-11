import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'

const Profile: NextPage = () => {
  const { authUser, loading } = useKryptikAuthContext();
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
        </div>

    </div>
 
  )
}

export default Profile