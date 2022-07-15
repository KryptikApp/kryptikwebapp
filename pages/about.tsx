import type { NextPage } from 'next'
import Divider from '../components/Divider'


const About: NextPage = () => {
  return (

    <div>

        <div className="h-[2rem]">
          {/* padding div for space between top and main elements */}
        </div>
      
        <div className="max-w-2xl mx-auto dark:text-white px-4 md:px-0">
          <h1 className="text-5xl text-left font-bold sans mb-5">
                The <span className="">Kryptik</span> Wallet
          </h1>

          <p className="leading-loose mb-2 text-xl text-justify dark:text-gray-400">Kryptik is a simple wallet that lets you save, send, and collect value across the internet. With Kryptik you can access a world of possibilities across 10+ blockchains from a single app. One <span className="text-purple-500">secure</span> wallet. One <span className="text-green-500">simple</span> interface. One <span className="text-sky-500">magical</span> future. </p>
          <Divider/>
          <h2 className="text-md">The Kryptik Way</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 flex-overflow place-items-center my-6">
            <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 px-2 rounded drop-shadow-lg max-w-[50%] min-h-[120px]">
                <h2 className="text-xl font-semibold">💻 Transparent</h2>
                <p className="text-gray-500 dark:text-gray-400">Kryptik is <span className="text-green-500">100%</span> open source. View the code <a className="hover:cursor-pointer hover:text-sky-500 text-sky-400" href={`https://github.com/KryptikApp/kryptikwebapp`} target="_blank" rel="noopener noreferrer">here</a>.</p>
            </div>
            <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 px-2 rounded drop-shadow-lg max-w-[50%] min-h-[120px]">
                <h2 className="text-xl font-semibold">🕺🏾 Elegant</h2>
                <p className="text-gray-500 dark:text-gray-400">Kryptik is designed to be simple and beautiful.</p>
            </div>
            <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 px-2 rounded drop-shadow-lg max-w-[50%] min-h-[120px]">
                <h2 className="text-xl font-semibold">🔒 Secure</h2>
                <p className="text-gray-500 dark:text-gray-400">Kryptik is noncustodial. We never touch your secret keys.</p>
            </div>
            <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 px-2 rounded drop-shadow-lg max-w-[50%] min-h-[120px]">
                <h2 className="text-xl font-semibold">🦄 Powerful</h2>
                <p className="text-gray-500 dark:text-gray-400">Kryptik supports <span className="text-green-500">10+</span> blockchains from a single app.</p>
            </div>
          </div>
        </div>

        <div className="h-[6rem]">
          {/* padding div for space between bottom and main elements */}
        </div>

    </div>
       

 
  )
}

export default About