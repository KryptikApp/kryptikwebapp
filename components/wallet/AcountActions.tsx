import Link from "next/link";
import {
  AiOutlineAccountBook,
  AiOutlineDollar,
  AiOutlineDollarCircle,
  AiOutlineLock,
  AiOutlineMoneyCollect,
  AiOutlineSetting,
  AiOutlineSwitcher,
  AiOutlineSync,
} from "react-icons/ai";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { AccountView } from "./AccountsCard";

export default function AccountActions(props: {
  accountView: AccountView;
  handleViewSwitch: (newView: AccountView) => void;
}) {
  const { accountView, handleViewSwitch } = props;
  const { kryptikWallet } = useKryptikAuthContext();

  return (
    <div className="w-full">
      <div className="flex flex-row space-x-12 mx-auto px-8 w-fit rounded-full border border-2 py-2 bg-gray-300/10 dark:bg-gray-700/10 hover:brightness-110 group">
        <div className="flex flex-col">
          <div className="p-2 rounded-full hover:cursor-pointer text-sky-500 hover:text-sky-600">
            <Link href="../profile/security">
              <AiOutlineLock size={30} />
            </Link>
          </div>
          <p className="text-center text-slate-700 dark:text-slate-200 text-sm">
            {" "}
          </p>
        </div>
        {accountView == AccountView.Addresses && (
          <div className="flex flex-col">
            <div
              className="border p-2 rounded-full hover:cursor-pointer text-sky-500 hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-800"
              onClick={() => handleViewSwitch(AccountView.Balances)}
            >
              <AiOutlineDollar size={30} />
            </div>
            <p className="text-center text-slate-700 dark:text-slate-200 text-sm">
              {" "}
            </p>
          </div>
        )}
        {accountView == AccountView.Balances && (
          <div className="flex flex-col">
            <div
              className="border p-2 rounded-full hover:cursor-pointer text-sky-500 hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-800"
              onClick={() => handleViewSwitch(AccountView.Addresses)}
            >
              <AiOutlineSwitcher size={30} />
            </div>
            <p className="text-center text-slate-700 dark:text-slate-200 text-sm">
              {" "}
            </p>
          </div>
        )}
        <div className="flex flex-col">
          <div className="p-2 rounded-full hover:cursor-pointer text-sky-400 hover:text-sky-600">
            <Link href="../profile/settings">
              <AiOutlineSetting size={30} />
            </Link>
          </div>
          <p className="text-center text-slate-700 dark:text-slate-200 text-sm">
            {" "}
          </p>
        </div>
      </div>
    </div>
  );
}
