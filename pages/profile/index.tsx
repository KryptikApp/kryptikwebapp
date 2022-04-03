import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Splash.module.css'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

const Profile: NextPage = () => {
  return (
    <div className="h-screen">
      <Head>
        <title>Kryptik</title>
        <meta name="description" content="Crypto made simple." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
    <main className="container px-4 mx-auto ">
     <Navbar></Navbar>

     <div className="h-[6rem]">
              {/* padding div for space between top and main elements */}
      </div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
           <h2>Welcome</h2>
           <div className="w-6/12 sm:w-4/12 px-4">
            <img src="https://www.creative-tim.com/learning-lab/tailwind-starter-kit/img/team-2-800x800.jpg" alt="..." className="shadow rounded-full max-w-full h-auto align-middle border-none" />
          </div>
        </div>


      </main>

    </div>
 
  )
}

export default Profile