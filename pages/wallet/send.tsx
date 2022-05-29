import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import ListBalance from '../../components/lists/ListBalance'
import HeaderProfile from '../../components/HeaderProfile'
import { isFloat32Array } from 'util/types'

const Send: NextPage = () => {
  const { authUser, loading } = useKryptikAuthContext();
  const [amount, setAmount] = useState("0");
  const router = useRouter();
  const allowedInputs = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  const handleAmountChange = function(amountIn:string){
      let amount:string = amountIn;
      // last character of amount string
      let lastChar:string = amount.charAt(amount.length - 1);
      // previous input
      let oldAmount:string = amount.slice(0, amount.length - 1);
      let secondlastChar:string = amount.charAt(amount.length - 2);
      // only allow valid charcaters as input
      if(!allowedInputs.includes(lastChar) || (lastChar == "." && oldAmount.includes('.'))){
          amount = oldAmount;
      }
      console.log(lastChar);
      console.log(secondlastChar);
      if(secondlastChar == "0" && amount.length == 3){
          amount = amount.slice(2, amount.length);
      }
      // don't allow non numeric characters to be introduced 
      // default amount should be zero, if empty string
      if(amount == ''){
        amount = "0";
      }
      setAmount(amount)
  }


  return (
    <div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
          <HeaderProfile user={authUser} showBio={false} center={true}/>
          <div className="flex justify-start mt-5">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" id="inline-full-name" placeholder="$0" required value={`$${amount}`} onChange={(e) => handleAmountChange(e.target.value)}/>
          </div>
          <Divider/>
          <ListBalance/>
        </div>

    </div>
 
  )
}

export default Send