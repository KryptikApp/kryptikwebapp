import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Splash.module.css'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const Explore: NextPage = () => {
  return (
    <div>

        <div className="h-[2rem]">
          {/* padding div for space between top and main elements */}
        </div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
           <p>Hey, this is an explore page!</p>
        </div>

    </div>
 
  )
}

export default Explore