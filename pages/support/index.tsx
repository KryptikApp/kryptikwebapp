import type { NextPage } from 'next'
import FAQ from '../../components/support/FAQ'
import { FAQs } from '../../src/support/FAQ'
import { IQuestionAnswer } from '../../src/support/FAQ/models'


const Vision: NextPage = () => {
  return (

    <div>

        <div className="h-[4vh]">
          {/* padding div for space between top and main elements */}
        </div>
      
        <div className="dark:text-white">
        <div className="max-w-2xl mx-auto px-4 md:px-0">
            <div className="mb-12">
                <h1 className="text-5xl font-bold sans mb-5">
                        Kryptik 🧠Base
                </h1>
                <p className="leading-loose mb-2 text-xl text-justify">Kryptik is a simple, secure wallet that lets you send, save, and collect crypto. This page answers commonly asked questions about Kryptik.</p>
            </div>
            <div className="mb-12 flex flex-col space-y-4">
            {
                 FAQs.map((faq:IQuestionAnswer, index:number)=>
                   <FAQ faq={faq} key={index}/>
                )
            }
            </div>
        </div>
          

        </div>

        <div className="h-[4rem]">
          {/* padding div for space between top and main elements */}
        </div>

    </div>
       

 
  )
}

export default Vision