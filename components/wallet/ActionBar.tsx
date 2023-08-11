import { NextPage } from "next";
import { useRouter } from "next/router";
import {
  AiFillDownCircle,
  AiFillPayCircle,
  AiFillPlusCircle,
  AiFillUpCircle,
} from "react-icons/ai";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
  active: boolean;
  asVertical?: boolean;
  hideBorder?: boolean;
}

enum ActionEnum {
  Swap = 0,
  Send = 1,
  Receive = 2,
  Connect = 3,
}

const ActionBar: NextPage<Props> = (props) => {
  const { walletStatus, kryptikService } = useKryptikAuthContext();
  const router = useRouter();
  const { active, asVertical, hideBorder } = { ...props };
  const [hasBalance, setHasBalance] = useState(false);

  useEffect(() => {
    console.log("Balances changed. Updating action bar.");
    const newBal = kryptikService.kryptikBalances.getTotalBalance();
    if (newBal > 0) {
      setHasBalance(true);
    } else {
      setHasBalance(false);
    }
  }, [kryptikService.kryptikBalances.getTotalBalance()]);

  function actionHandler(action: ActionEnum) {
    if (!active) return;
    switch (action) {
      case ActionEnum.Swap: {
        if (!hasBalance) {
          toast("You don't have any assets to swap.", {
            icon: "👻",
          });
          return;
        }
        router.push("../wallet/swap");
        break;
      }
      case ActionEnum.Send: {
        if (!hasBalance) {
          toast("You don't have any assets to send.", {
            icon: "👻",
          });
          return;
        }
        router.push("../wallet/send");
        break;
      }
      case ActionEnum.Receive: {
        router.push("../wallet/receive");
        break;
      }
      case ActionEnum.Connect: {
        router.push("../connect");
      }
      default: {
        // pass for now
        break;
      }
    }
  }

  return (
    <div
      className={`flex ${
        asVertical &&
        "flex-col text-xl border border-sky-400/50 dark:border-sky-400/50 bg-gray-100/10 dark:bg-gray-800/10 hover:cursor-pointer"
      } max-w-m my-6 ${
        !hideBorder && "border"
      } border-gray-500 dark:border-gray-300 rounded-xl `}
    >
      <div
        className={`flex-1 ${
          !asVertical
            ? "border-r rounded-tl-xl rounded-bl-xl"
            : "w-full rounded-tr-xl rounded-tl-xl px-2"
        }  border-gray-500 dark:border-gray-300 py-2 ${
          active ? "hover:bg-green-500" : "disabled"
        }`}
        onClick={() => actionHandler(ActionEnum.Swap)}
      >
        <div
          className={`${asVertical && "flex flex-row space-x-1 w-fit"}   ${
            active
              ? "hover:font-semibold hover:animate-pulse hover:cursor-pointer hover:text-sky-800 text-sky-500 transition duration-300 ease-in-out"
              : "text-slate-500"
          } `}
        >
          <AiFillPayCircle className="mx-auto" size="30" />
          <span className="text-gray-700 dark:text-gray-200 font-semibold">
            Swap
          </span>
        </div>
      </div>
      <div
        className={`flex-1 ${
          !asVertical ? "border-r" : "w-full px-2"
        } border-gray-500 dark:border-gray-300 py-2 
           ${active ? "hover:bg-sky-500" : "disabled"}`}
        onClick={() => actionHandler(ActionEnum.Connect)}
      >
        <div
          className={`text-center ${
            asVertical && "flex flex-row space-x-1 w-fit"
          }  ${
            active
              ? "hover:font-semibold hover:animate-pulse hover:cursor-pointer hover:text-sky-800 text-sky-500 transition duration-300 ease-in-out"
              : "text-slate-500"
          } `}
        >
          <AiFillPlusCircle className="mx-auto" size="30" />
          <span className="text-gray-700 dark:text-gray-200 font-semibold my-auto">
            Connect
          </span>
        </div>
      </div>
      <div
        className={`flex-1 ${
          !asVertical ? "border-r" : "w-full px-2"
        } border-gray-500 dark:border-gray-300 py-2 ${
          active ? "hover:bg-green-500" : "disabled"
        }`}
      >
        <div
          className={`text-center ${
            asVertical && "flex flex-row space-x-1 w-fit"
          }   ${
            active
              ? "hover:font-semibold hover:animate-pulse hover:cursor-pointer hover:text-sky-800 text-sky-500 transition duration-300 ease-in-out"
              : "text-slate-500"
          } `}
          onClick={() => actionHandler(ActionEnum.Receive)}
        >
          <AiFillDownCircle className="mx-auto" size="30" />
          <span className="text-gray-700 dark:text-gray-200 font-semibold">
            Receive
          </span>
        </div>
      </div>
      <div
        className={`flex-1 py-2 ${
          !asVertical
            ? "border-r rounded-tr-xl rounded-br-xl"
            : "w-full rounded-br-xl rounded-bl-xl px-2"
        } ${active ? "hover:bg-sky-500" : "disabled"}`}
        onClick={() => actionHandler(ActionEnum.Send)}
      >
        <div
          className={`text-center ${
            asVertical && "flex flex-row space-x-1 w-fit"
          }   ${
            active
              ? "hover:font-semibold hover:animate-pulse hover:cursor-pointer hover:text-sky-800 text-sky-500 transition duration-300 ease-in-out"
              : "text-slate-500"
          } `}
        >
          <AiFillUpCircle className="mx-auto" size="30" />
          <span className="text-gray-700 dark:text-gray-200 font-semibold">
            Send
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
