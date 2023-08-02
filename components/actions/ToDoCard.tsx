import { useEffect, useState } from "react";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { WalletAction } from "../../src/helpers/actions/models";
import { defaultUser } from "../../src/models/user";

export default function ToDoCard() {
  const [progressPercent, setProgressPercent] = useState(50);
  const { openActions, removeOpenAction, authUser } = useKryptikAuthContext();
  const [currentAction, setCurrentAction] = useState<WalletAction | null>(null);
  useEffect(() => {
    if (openActions.length > 0) {
      setCurrentAction(openActions[0]);
    }
  }, [openActions]);
  return (
    <div className="my-6 mx-auto">
      {authUser && authUser != defaultUser && (
        <div className="flex flex-col rounded-xl ring-2 ring-gray-500/20 w-full">
          <ProgressIndicator progressPercent={progressPercent} />
          <div className="px-4">
            <div className="my-4">
              {currentAction && (
                <div>
                  <h1
                    className="text-2xl text-black dark:text-white"
                    style={{ color: currentAction.getHexColor() }}
                  >
                    {currentAction.getTitle()}
                  </h1>
                  <p className="text-lg text-black dark:text-white">
                    {currentAction.getDescription()}
                  </p>
                </div>
              )}
              {!currentAction && (
                <div>
                  <h1 className="text-2xl text-black dark:text-white">To Do</h1>
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            <div className="flex flex-row divide-x border-t border-gray-500/70 divide-gray-500/70">
              <div className="flex flex-col w-1/2 rounded-bl-xl text-center py-4">
                Next
              </div>
              <div className="flex flex-col w-1/2 rounded-br-xl text-center py-4">
                Back
              </div>
            </div>
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
