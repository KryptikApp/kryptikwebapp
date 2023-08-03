import { useEffect, useState } from "react";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { WalletAction } from "../../src/helpers/actions/models";
import { defaultUser } from "../../src/models/user";
import { handleApprove } from "../../src/helpers/auth";
import { toast } from "react-hot-toast";
import { AiFillCheckCircle } from "react-icons/ai";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ToDoList() {
  const router = useRouter();
  const [progressPercent, setProgressPercent] = useState(50);
  const { openActions, removeOpenAction, authUser, completedActions } =
    useKryptikAuthContext();

  async function handleCompleteAction(action: WalletAction) {
    if (!action) return;
    // complete actions
    if (action.getTitle().includes("Uniswap")) {
      //open uniswap app in new tab
      // TODO: ensure
      const success = await removeOpenAction(action);
      if (success) {
        window.open("https://app.uniswap.org/", "_blank");
      } else {
        console.warn("Failed to complete action.");
      }
    }
    if (action.getTitle().includes("Connect App")) {
      router.push("/connect");
    }
    if (action.getTitle().includes("Get Paid")) {
      router.push("/wallet/receive");
    }
  }
  async function handleSkipAction(action: WalletAction) {
    // skip actions
    const success = await removeOpenAction(action);
    if (success) {
      toast.success("Action skipped.");
    } else {
      toast.error("Failed to skip action.");
    }
  }
  return (
    <div className="my-6 mx-auto">
      {openActions.length == 0 && (
        <div>
          <p>No wallet actions to complete at this time!</p>
          <p>
            <Link
              href="/wallet"
              className="font-semibold text-sky-400 hover:font-bold"
            >
              Go To Wallet
            </Link>
          </p>
        </div>
      )}
      {openActions.length > 0 && (
        <div className="flex flex-col space-y-6">
          {openActions.map((action, index) => {
            return (
              <ToDoItem
                action={action}
                key={index}
                handleClickComplete={handleCompleteAction}
                handleClickSkip={handleSkipAction}
              />
            );
          })}
        </div>
      )}
      {completedActions.length > 0 && (
        <div>
          <h1 className="text-lg font-semibold text-gray-500 mb-3 mt-6">
            Completed
          </h1>
          <div className="flex flex-col space-y-6">
            {completedActions.map((action, index) => {
              return <ToDoItemDone action={action} key={index} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressIndicator(params: { progressPercent: number }) {
  const { progressPercent } = { ...params };
  return (
    <div className="w-full h-2 bg-gray-500/70 rounded-tr-xl rounded-tl-xl">
      <div
        className="h-full bg-green-400/90 rounded-tr-xl rounded-tl-xl"
        style={{ width: `${progressPercent}%` }}
      ></div>
    </div>
  );
}

function ToDoItem(params: {
  action: WalletAction;
  handleClickComplete: (action: WalletAction) => any;
  handleClickSkip: (action: WalletAction) => any;
}) {
  const { action, handleClickComplete, handleClickSkip } = { ...params };
  return (
    <div
      className="rounded-xl ring-2 ring-gray-500/20 w-full border"
      style={{ borderColor: action.getHexColor() }}
    >
      <div className="w-full h-4 bg-gray-500/70 rounded-tr-xl rounded-tl-xl">
        <div
          className="w-full h-full bg-green-400/90 rounded-tr-xl rounded-tl-xl"
          style={{
            backgroundColor: action.getHexColor(),
          }}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between py-2 px-2  space-x-2">
          <img
            src={action.getIcon()}
            alt="icon"
            className="w-8 h-8 rounded-lg my-auto"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl text-left font-semibold text-black dark:text-white">
              {action.getTitle()}
            </h1>
            <p className="text-md text-gray-700 dark:text-gray-200">
              {action.getDescription()}
            </p>
          </div>
        </div>
        <div className="w-full mt-2">
          <div className="flex flex-row divide-x border-t border-gray-500/70 divide-gray-500/70 text-lg">
            <div
              className="flex flex-col w-1/2 rounded-bl-xl text-center py-4 hover:bg-gray-200/20 hover:dark:bg-gray-700/20 transition-colors duration-300 hover:cursor-pointer"
              onClick={() => handleClickSkip(action)}
            >
              Skip
            </div>
            <div
              className="flex flex-col w-1/2 rounded-br-xl text-center py-4 hover:bg-gray-700 hover:text-white hover:dark:bg-gray-200 hover:dark:text-black transition-colors duration-300 hover:cursor-pointer"
              onClick={() => handleClickComplete(action)}
            >
              Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToDoItemDone(params: { action: WalletAction }) {
  const { action } = { ...params };
  return (
    <div className="rounded-xl ring-2 ring-gray-500/20 w-full brightness-50 hover:brightness-100 transition duration-300">
      <div className="w-full h-4 bg-gray-500/70 rounded-tr-xl rounded-tl-xl">
        <div
          className="w-full h-full bg-green-400/90 rounded-tr-xl rounded-tl-xl"
          style={{ backgroundColor: action.getHexColor() }}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between py-2 px-2  space-x-2">
          <img
            src={action.getIcon()}
            alt="icon"
            className="w-8 h-8 rounded-lg my-auto"
          />
          <div className="flex flex-col">
            <div className="flex flex-row space-x-2">
              <h1 className="text-2xl font-semibold text-black dark:text-white">
                {action.getTitle()}
              </h1>
              <AiFillCheckCircle
                className="text-2xl my-auto"
                style={{ color: action.getHexColor() }}
              />
            </div>

            <p className="text-md text-gray-700 dark:text-gray-200">
              {action.getDescription()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
