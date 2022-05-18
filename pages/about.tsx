import type { NextPage } from 'next'


const About: NextPage = () => {
  return (

    <div>

        <div className="h-[2rem]">
          {/* padding div for space between top and main elements */}
        </div>
      
        <div className="lg:px-[30%]">
          <h1 className="text-4xl font-bold sans mb-5">
                About Kryptik
          </h1>
          <p className="leading-loose mb-2 text-justify">Key pairs can do wonderful things, but existing wallets like Metamask and Rainbow confine their magic to a single blockchain. The Kryptik wallet is built to break through the borders of Ethereum and streamline digital ownership across the internet.</p>
          <p className="leading-loose text-justify"> One <span className="hover:text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-green-500 font-bold">secure</span> wallet. One <span className="hover:text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-green-500 font-bold">simple</span> interface. One <span className="hover:text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-green-500 font-bold">magical</span> future.</p>
        </div>

    </div>
       

 
  )
}

export default About