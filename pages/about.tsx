import type { NextPage } from 'next'
import {Chart as ChartJS, LinearScale, PointElement, LineElement, TimeScale, Tooltip, ArcElement, DoughnutController, Legend} from 'chart.js'
import {Chart} from 'react-chartjs-2';
import { useKryptikThemeContext } from '../components/ThemeProvider';
import { AiOutlineLink } from 'react-icons/ai';
import Link from 'next/link';

ChartJS.register(LinearScale, PointElement, LineElement, TimeScale, ArcElement, DoughnutController, Legend, Tooltip);

const About: NextPage = () => {
  const {isDark} = useKryptikThemeContext();
  return (

    <div>
        <div className="dark:text-white">
          <div className="min-h-[100vh]">

            <div className="min-h-[20vh]">
              {/* padding div for space between top and main elements */}
            </div>

            <div className="px-4 md:px-0  max-w-2xl mx-auto">
              <h1 className="text-5xl text-left font-bold sans mb-5">
                    The <span className="">Kryptik</span> Wallet
              </h1>
              <p className="leading-loose mb-2 text-xl text-justify dark:text-gray-400">Kryptik is a simple wallet that lets you save, send, and collect value across the internet. With Kryptik you can access a world of possibilities across 10+ blockchains from a single app. One <span className="text-purple-500">secure</span> wallet. One <span className="text-green-500">simple</span> interface. One <span className="text-sky-500">magical</span> future. </p>
              <p className="text-md mt-8 text-gray-700 dark:text-gray-200 text-right">Learn more about Kryptik <span className="text-sky-400"><Link href="../support">here</Link></span> 💥</p>
              <p className="text-md mt-8 text-gray-700 dark:text-gray-200 text-right">Check out the Kryptik docs <span className="text-sky-400"><Link href="../docs">here</Link></span> 📜</p>
            </div>

            <div className="min-h-[10vh]">
              {/* padding div for space between about and more info */}
            </div>

            <div className="-mx-4">
            {/* <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl text-center md:text-left font-semibold sans pt-4 md:pt-20 mb-5 dark:text-slate-100">Unlock the 🌎 of Crypto</h2>
            </div> */}
            <div className="">
           
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center my-6 pb-6 max-w-3xl mx-auto">
              <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 pt-2 pb-8 px-4 rounded drop-shadow-lg max-w-[60%] md:max-w-[80%] min-h-[140px]">
                  <div className="text-5xl">💻</div>
                  <h2 className="text-xl font-semibold">Transparent</h2>
                  <p className="text-gray-500 dark:text-gray-400">Kryptik is <span className="text-green-500">100%</span> open source. View the code <a className="hover:cursor-pointer hover:text-sky-500 text-sky-400" href={`https://github.com/KryptikApp/kryptikwebapp`} target="_blank" rel="noopener noreferrer">here</a>.</p>
              </div>
              <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 pt-2 pb-8 px-4 rounded drop-shadow-lg max-w-[60%] md:max-w-[80%] min-h-[140px]">
                  <div className="text-5xl">🕺🏾 </div>
                  <h2 className="text-xl font-semibold">Elegant</h2>
                  <p className="text-gray-500 dark:text-gray-400">Kryptik is designed to be simple and beautiful to the max.</p>
              </div>
              <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 pt-2 pb-8 px-4 rounded drop-shadow-lg max-w-[60%] md:max-w-[80%] min-h-[140px]">
                  <div className="text-5xl">🔒 </div>
                  <h2 className="text-xl font-semibold">Secure</h2>
                  <p className="text-gray-500 dark:text-gray-400">Kryptik is noncustodial. We never touch your <span className="text-[#eacc15]">secret</span> keys.</p>
              </div>
              <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 pt-2 pb-8 px-4 rounded drop-shadow-lg max-w-[60%] md:max-w-[80%] min-h-[140px]">
                  <div className="text-5xl">🦄 </div>
                  <h2 className="text-xl font-semibold">Powerful</h2>
                  <p className="text-gray-500 dark:text-gray-400">Kryptik supports <span className="text-sky-400">10+</span> blockchains from a single app.</p>
              </div>
              <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 pt-2 pb-8 px-4 rounded drop-shadow-lg max-w-[60%] md:max-w-[80%] min-h-[140px]">
                  <div className="text-5xl">🙏🏽 </div>
                  <h2 className="text-xl font-semibold">Free</h2>
                  <p className="text-gray-500 dark:text-gray-400">Kryptik is <span className="text-green-400">100%</span> free. No hidden fees and no service charges.</p>
              </div>
              <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 pt-2 pb-8 px-4 rounded drop-shadow-lg max-w-[60%] md:max-w-[80%] min-h-[140px]">
                  <div className="text-5xl">🔮 </div>
                  <h2 className="text-xl font-semibold">Magical</h2>
                  <p className="text-gray-500 dark:text-gray-400">Kryptik is designed with lots of care and a dash of <span className="text-purple-300">magic</span>.</p>
              </div>
              </div>
              </div>
            </div>

          </div>
          
          

          <div className="min-h-[100vh] max-w-2xl mx-auto pt-4 md:pt-20 mb-5 md:mb-20">
          <div className="mb-10">
            <h1 className="text-5xl text-left font-bold sans mb-4">
                  Kryptik Supporters
            </h1>
            <p className="leading-loose text-xl text-justify dark:text-gray-400">Kryptik has been made possible by the generous support of the following organizations.</p>
          </div>  
          <Chart
            data={{ datasets: [{
              data: [500, 45000, 20000],
              backgroundColor:[
                "#c41230",
                "#6B6EF9",
                "#00FFA3"
              ]
            }],  
            labels: [
                'Carnegie Mellon Research',
                'Near Foundation',
                'Solana Foundation'
            ]}}
            type="doughnut"
            options={{
              plugins:{
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    font:{
                      size: 16
                    },
                    color: isDark?"#f5f5f5":"#1c1c1c"
                  }
                },
                tooltip: {
                  callbacks: {
                      label: function(context) {
                          let label = context.label || '';
                          if (label) {
                              label += ': ';
                          }
                          if (context.parsed !== null) {
                              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                          }
                          return label;
                      }
                  }
                }
              }
            }}
            width={400}
            height={400}
          />
          </div>
        
        <div className="max-w-2xl py-2 mx-auto">
          <a href="https://gitcoin.co/grants/7813/kryptik-wallet" target="_blank" rel="noopener noreferrer">
          <div className='hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-105 flex flex-col border rounded-lg p-2 shadow-md shadow-sky-400 hover:shadow-green-500'>

            <div className='flex flex-row'>
              {
                isDark?
                <img src="/media/partners/gitcoinLight.svg" width="80" className='mr-2'/>:
                <img src="/media/partners/gitcoinDark.svg" width="80" className='mr-2'/>
              }
              <h1 className="text-4xl font-semibold mt-4">Support Kryptik</h1>
              <div className="flex-grow">
                <AiOutlineLink size="30" className='float-right'/>
              </div>
            </div>
            
            <p className="text-lg text-gray-500 dark:text-gray-400">Help support the development of essential features and security updates. Your donations will keep Kryptik free and open to everyone.</p>
              
          </div>
          </a>
            
            
        </div>

        </div>

        

        <div className="h-[6rem]">
          {/* padding div for space between bottom and main elements */}
        </div>

    </div>
       

 
  )
}

export default About