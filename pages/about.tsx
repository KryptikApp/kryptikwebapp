import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Splash.module.css'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const About: NextPage = () => {
  return (
    <div className="h-screen">
      <Head>
        <title>Art</title>
        <meta name="description" content="Spread the crypto love!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
    <main className="container px-4 mx-auto ">
     <Navbar></Navbar>

        <div className="h-[2rem]">
          {/* padding div for space between top and main elements */}
        </div>
      

        <div className="text-center max-w-2xl mx-auto content-center">
           <p>Hey, this is an about page!</p>
        </div>



      </main>

    </div>
 
  )
}

export default About