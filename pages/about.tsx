import type { NextPage } from 'next'
import {Chart as ChartJS, LinearScale, PointElement, LineElement, TimeScale, Tooltip, ArcElement, DoughnutController, Legend} from 'chart.js'
import {Chart} from 'react-chartjs-2';
import { useKryptikThemeContext } from '../components/ThemeProvider';

ChartJS.register(LinearScale, PointElement, LineElement, TimeScale, ArcElement, DoughnutController, Legend, Tooltip);

const About: NextPage = () => {
  const {isDark} = useKryptikThemeContext();
  return (

    <div>
        <div className="dark:text-white">
          <div className="max-w-2xl mx-auto px-4 md:px-0 min-h-[100vh]">
          <div className="min-h-[20vh]">
            {/* padding div for space between top and main elements */}
          </div>
            <h1 className="text-5xl text-left font-bold sans mb-5">
                  The <span className="">Kryptik</span> Wallet
            </h1>

            <p className="leading-loose mb-2 text-xl text-justify dark:text-gray-400">Kryptik is a simple wallet that lets you save, send, and collect value across the internet. With Kryptik you can access a world of possibilities across 10+ blockchains from a single app. One <span className="text-purple-500">secure</span> wallet. One <span className="text-green-500">simple</span> interface. One <span className="text-sky-500">magical</span> future. </p>
          </div>
          
          <div className="min-h-[100vh] -mx-4 dark:bg-[#0f0f0f] xl:dark:bg-black">
            <div className="max-w-2xl mx-auto">
            <h2 className="text-5xl text-center md:text-left font-bold sans pt-4 md:pt-20 mb-5 md:mb-20">The Kryptik Way</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 place-items-center my-6 pb-6 max-w-3xl mx-auto">
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
              <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 px-2 rounded drop-shadow-lg max-w-[50%] min-h-[120px]">
                  <h2 className="text-xl font-semibold">🙏🏽 Free</h2>
                  <p className="text-gray-500 dark:text-gray-400">Kryptik is <span className="text-green-400">100%</span> free. No hidden fees and no service charges.</p>
              </div>
              <div className="hover:cursor-pointer hover:z-10 transition ease-in-out hover:scale-110 bg-gray-200 dark:bg-[#111112] border border-gray-300 my-2 px-2 rounded drop-shadow-lg max-w-[50%] min-h-[120px]">
                  <h2 className="text-xl font-semibold">🔮 Magical</h2>
                  <p className="text-gray-500 dark:text-gray-400">Kryptik is designed with lots of care and a dash of magic.</p>
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
                "#A7A7A7",
                "#00FFA3"
              ]
            }],  
            labels: [
                'Carnegie Mellon Research Grant',
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
        </div>

        <div className="h-[6rem]">
          {/* padding div for space between bottom and main elements */}
        </div>

    </div>
       

 
  )
}

export default About