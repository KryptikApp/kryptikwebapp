import type { NextPage } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ReactCodeInput from "react-code-input";

import Image from "next/image";
import { useRouter } from "next/router";
import { useKryptikThemeContext } from "../ThemeProvider";
import { KryptikFetch } from "../../src/kryptikFetch";
import Link from "next/link";
import { isValidEmailAddress } from "../../src/helpers/resolvers/kryptikResolver";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import LoadingSpinner from "../loadingSpinner";
import { hasPasskeys, registerPasskey } from "../../src/helpers/auth/passkey";
import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";
import { isEmailTaken } from "../../src/helpers/user";
import { LoginFlow } from "../../src/models/LoginFlow";
import AuthProviderCard from "./CardAuthProvider";
import {
  AiOutlineArrowRight,
  AiOutlineLogin,
  AiOutlineMail,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import { LocalAccount } from "../../src/helpers/auth/types";
import { getLocalAccounts } from "../../src/helpers/auth";
import { set } from "lodash";
import { trimUid } from "../../src/helpers/utils/accountUtils";

enum LoginType {
  email = 0,
  passkey = 1,
}
const LoginCardWithOptions: NextPage = () => {
  const { signInWithToken, signInWithPasskey } = useKryptikAuthContext();
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initPasskeyFlow, setInitPasskeyFlow] = useState(false);
  const [redirectToPath, setRedirectToPath] = useState<null | string>(null);
  const [loginStep, setLoginStep] = useState<LoginFlow>(LoginFlow.Start);
  const sendLink: boolean = false;
  const { isDark } = useKryptikThemeContext();
  const [code, setCode] = useState("");
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>(LoginType.email);
  const [localAccounts, setLocalAccounts] = useState<null | LocalAccount[]>(
    null
  );
  const [loadingLocalAccounts, setLoadingLocalAccounts] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  function handleStatusUpdate(msg: string, progress?: number) {
    setLoadingMessage(msg);
  }

  useEffect(() => {
    // pull network ticker from route
    if (router.query["from"] && typeof router.query["from"] == "string") {
      const newFromPath = router.query["from"];
      setRedirectToPath(newFromPath);
    }
  }, [router.isReady]);

  async function handleGetLocalAccounts() {
    if (localAccounts) return;
    setLoadingLocalAccounts(true);
    console.log("Getting local accounts...");
    const newAccounts = await getLocalAccounts();
    setLocalAccounts(newAccounts);
    console.log("Done getting local accounts.");
    setLoadingLocalAccounts(false);
    console.log("Local accounts: ", newAccounts);
    if (newAccounts.length > 0) {
      setLoginStep(LoginFlow.SelectAccount);
    } else {
      setLoginStep(LoginFlow.Start);
    }
  }

  useEffect(() => {
    handleGetLocalAccounts();
  }, []);

  async function sendEmailCode(emailToUse?: string): Promise<boolean> {
    if (isValidEmailAddress(email)) {
      emailToUse = email;
    }
    if (!emailToUse) {
      return false;
    }

    const params = {
      email: emailToUse,
      sendLink: sendLink,
    };
    try {
      const res = await KryptikFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(params),
        timeout: 8000,
        headers: { "Content-Type": "application/json" },
      });
      if (res.status != 200) {
        toast.error("Unable to login.");
        return false;
      }
      setSentEmail(true);
      setLoading(false);
      setInitPasskeyFlow(false);
      toast.success("Email sent!");
      return true;
    } catch (e) {
      setLoading(false);
      // adding events failed. notfy user.
      toast("Unable to send varification email.");
      return false;
    }
  }

  async function loginWithPasskey(
    id: { email?: string; uid?: string },
    hasPasskey: boolean
  ) {
    console.log("Logging in with passkey");
    if (id.email) setEmail(id.email);
    setInitPasskeyFlow(true);
    setLoadingApproval(true);
    handleStatusUpdate("Building wallet on device.");
    setLoading(false);
    const approvedStatus: boolean = await signInWithPasskey(id, hasPasskey);
    if (approvedStatus) {
      toast.success("You are now logged in!");
      setLoadingApproval(false);
      setInitPasskeyFlow(false);
      // redirect to main page or previous (if set)
      if (redirectToPath) {
        router.push(redirectToPath);
      } else {
        router.push("/");
      }
      return;
    } else if (id.email) {
      toast("Trying email instead.");
      setLoadingApproval(false);
      setLoginType(LoginType.email);
      const sentEmail = await sendEmailCode(id.email);
      if (sentEmail) {
        setLoginStep(LoginFlow.SetEmail);
      } else {
        toast.error("Unable to send email.");
      }
      return;
    } else {
      // TODO: HANDLE CASE WHEN NO PASSKEYS AND NO EMAIL AVAILABLE ON LOCAL CLIENT
      // THIS WILL OCCUR WHEN USER REGISTERS WITH PASSKEY AND THEN TRIES TO LOGIN ON ANOTHER DEVICE
      // OR WHEN REGISTERING WITH PASSKEY AND FAILS
      toast.error("Unable to login. Please contact support.");
      handleBack();
    }
  }

  async function handleEmailLogin() {
    if (!isValidEmailAddress(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    const hasPasskey = await hasPasskeys({ email: email });

    const emailTaken: boolean = await isEmailTaken(email);
    try {
      setLoading(true);
      setLoginType(LoginType.email);
      await sendEmailCode();
    } catch (e) {
      toast.error("Unable to initiate login.");
      return;
    }
  }

  function handleEmailChange(newEmail: string) {
    setEmail(newEmail);
  }

  /**
   * Register new user with passkey. Should only be used to register new user.
   */
  function handleRegisterWithPasskey() {
    setInitPasskeyFlow(true);
    setLoginStep(LoginFlow.SetPasskey);
    setLoginType(LoginType.passkey);
    loginWithPasskey({}, false);
  }

  function handleStartEmailFlow() {
    setInitPasskeyFlow(false);
    setLoginStep(LoginFlow.SetEmail);
  }

  function handleBack() {
    const hasAccounts = hasLocalAccounts();
    if (hasAccounts && loginStep == LoginFlow.Start) {
      setLoginStep(LoginFlow.SelectAccount);
    }
    if (loginStep == LoginFlow.SetEmail && !hasAccounts) {
      setLoginStep(LoginFlow.Start);
    }
    if (loginStep == LoginFlow.SetPasskey && !hasAccounts) {
      setLoginStep(LoginFlow.Start);
    }
    if (loginStep == LoginFlow.SetPasskey && hasAccounts) {
      setLoginStep(LoginFlow.SelectAccount);
    }
    if (loginStep == LoginFlow.SetEmail && hasAccounts) {
      setLoginStep(LoginFlow.SelectAccount);
    }
    setSentEmail(false);
    setCode("");
    setEmail("");
  }

  function handleClickCreateNew() {
    setLoginStep(LoginFlow.Start);
  }

  async function handleAccountSelection(account: LocalAccount) {
    console.log("Selected account: ", account);
    const supportsPasskeys = await platformAuthenticatorIsAvailable();
    const browserSupportsPasskeys = browserSupportsWebAuthn();
    if (account.passkeyEnabled && supportsPasskeys && browserSupportsPasskeys) {
      setLoginType(LoginType.passkey);
      loginWithPasskey({ uid: account.uid, email: account.email }, true);
    } else {
      setLoginStep(LoginFlow.SetEmail);
      setLoginType(LoginType.email);
    }
  }

  function hasLocalAccounts() {
    return localAccounts && localAccounts.filter((a) => a.exists).length > 0;
  }

  async function handleCodeChage(newCode: string) {
    setCode(newCode);
    if (newCode.length == 7) {
      setLoadingApproval(true);
      handleStatusUpdate("Building wallet on device.");
      const approvedStatus: boolean = await signInWithToken(newCode, email);
      if (approvedStatus) {
        toast.success("You are now logged in!");
        setLoadingApproval(false);
        // redirect to main page or previous (if set)
        if (redirectToPath) {
          router.push(redirectToPath);
        } else {
          router.push("/");
        }
        return;
      } else {
        setLoadingApproval(false);
        toast.error("Unable to verify code.");
        return;
      }
    }
  }

  function canGoBack() {
    const hasAccounts = hasLocalAccounts();
    if (loginStep == LoginFlow.SelectAccount && hasAccounts) return false;
    return (
      loginStep != LoginFlow.Start ||
      (loginStep == LoginFlow.Start && hasAccounts)
    );
  }

  return (
    <div className="dark:text-white">
      {loginStep == LoginFlow.Start && loadingLocalAccounts && (
        <div>
          <div>
            <Image
              src="/kryptikBrand/kryptikEyez.png"
              className="rounded-full mx-auto"
              alt={"Kryptik Eyes"}
              width={40}
              height={40}
            />
            <p className="text-gray-700 dark:text-gray-400 text-lg font-semibold mb-4 text-center">
              Sign-in to Web3
            </p>
          </div>
          <p className="text-gray-500 text-center">Loading Accounts...</p>
        </div>
      )}
      {loginStep == LoginFlow.Start && !loadingLocalAccounts && (
        <div>
          <div>
            <Image
              src="/kryptikBrand/kryptikEyez.png"
              className="rounded-full mx-auto"
              alt={"Kryptik Eyes"}
              width={40}
              height={40}
            />
            <p className="text-gray-700 dark:text-gray-400 text-lg font-semibold mb-4 text-center">
              Sign-in to Web3
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 max-w-sm mx-auto">
            <AuthProviderCard
              clickHandler={() => {
                handleRegisterWithPasskey();
              }}
            >
              <div className="ring-1 ring-green-500 bg-green-400/20 w-fit px-2 py-1 rounded-xl absolute ml-28">
                <p className="text-xs text-center">Fast</p>
              </div>
              <div className="flex flex-col space-y-2 relative">
                <AiOutlineLogin size={30} className="self-center" />
                <p className="text-xl self-center">Passkey</p>
              </div>
            </AuthProviderCard>
            <AuthProviderCard clickHandler={() => handleStartEmailFlow()}>
              {/* center content */}
              <div className="flex flex-col space-y-2 align-center">
                <AiOutlineMail size={30} className="self-center" />
                <p className="text-xl self-center">Email</p>
              </div>
            </AuthProviderCard>
          </div>
        </div>
      )}

      {loginStep == LoginFlow.SelectAccount &&
        hasLocalAccounts() &&
        localAccounts && (
          <div className="">
            <div className="max-w-md mx-auto mb-10">
              <h1 className="text-2xl font-semibold">Choose an account</h1>
              <p className="text-lg text-gray-500">to continue</p>
            </div>
            <div className="flex flex-col ring ring-2 ring-sky-400 rounded-lg max-w-md w-full mx-auto divide-y divide-gray-400/70 py-1 dark:text-gray-200 text-gray-700 font-semibold">
              {localAccounts
                .filter((a) => a.exists)
                .map((account: LocalAccount) => {
                  return (
                    <LocalAccountOption
                      account={account}
                      clickHandler={handleAccountSelection}
                      key={
                        account.uid
                          ? account.uid
                          : account.email
                          ? account.email
                          : Math.random().toString()
                      }
                    />
                  );
                })}
              <AccountOption clickHandler={handleClickCreateNew}>
                <div className="flex flex-row space-x-2 text-green-500">
                  <AiOutlinePlusCircle size={20} className="my-auto" />
                  <p className="">Create New</p>
                </div>
              </AccountOption>
            </div>
          </div>
        )}
      {
        // passkey login
        loginStep == LoginFlow.SetPasskey && (
          <div>
            {initPasskeyFlow && (
              <div className="flex flex-col">
                <Image
                  src="/icons/orb.gif"
                  alt="Orb"
                  width={200}
                  height={200}
                  className="mx-auto rounded-xl"
                />
              </div>
            )}
          </div>
        )
      }
      {loginStep == LoginFlow.SetEmail && (
        <div className="bg-[#FBFDFD] dark:bg-gradient-to-br dark:to-[#0d0d0d] dark:from-[#0c0c0c] max-w-md mx-auto rounded-lg border border-solid dark:border-gray-800 border-gray-100 hover:dark:border-green-400 drop-shadow dark:text-white pt-2 px-2 pb-10 min-h-[280px]">
          <div className="flex flex-row mt-1">
            <div className="w-10 my-auto">
              <img
                src="/kryptikBrand/kryptikEyez.png"
                className="rounded-full"
              />
            </div>
            <h2 className="font-bold text-md ml-2 mb-1 text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-green-500">
              Kryptik
            </h2>
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-center mb-4">Welcome</h1>
          </div>
          <div className="">
            {!sentEmail && loading && !initPasskeyFlow && (
              <div>
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 text-center">
                  Sending email...
                </p>
              </div>
            )}
            {!loading && !sentEmail && !initPasskeyFlow && (
              <div className="px-6">
                <div className="flex flex-col mb-4">
                  <input
                    type="email"
                    className="bg-gray-200 dark:bg-gray-700 appearance-none border border-gray-200 rounded w-full py-3 px-4 text-gray-800 dark:text-white leading-tight focus:outline-none focus:bg-white focus:border-sky-400 dark:focus:border-sky-500 text-2xl"
                    id="inline-full-name"
                    placeholder="Enter your email"
                    required
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                  <button
                    onClick={() => handleEmailLogin()}
                    className={`bg-transparent hover:bg-green-500 text-green-500 text-2xl font-semibold hover:text-white py-2 px-4 ${
                      loading || sentEmail ? "hover:cursor-not-allowed" : ""
                    } border border-green-500 hover:border-transparent rounded-lg mt-5 mb-2`}
                    disabled={loading || sentEmail}
                  >
                    Sign In
                  </button>
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
                    If you already have an account, you will be logged in.
                  </p>
                </div>
                <div className="text-center max-w-2xl mx-auto content-center">
                  <Link href="../wallet/import">
                    <span className="text-sky-300 dark:text-sky-600 hover:cursor-pointer hover:text-blue transition-colors duration-300">
                      or import existing seed
                    </span>
                  </Link>
                </div>
              </div>
            )}
            {!loading && sentEmail && !loadingApproval && !initPasskeyFlow && (
              <div>
                <div className="mb-10 ml-[5%] md:ml-[14%]">
                  <ReactCodeInput
                    name="Your Code"
                    fields={7}
                    inputMode={"numeric"}
                    onChange={handleCodeChage}
                    disabled={loadingApproval}
                  />
                </div>
                <div className="flex flex-row text-center place-content-center">
                  <p className="text-md text-gray-600 dark:text-gray-300">
                    Enter your eight digit code.
                  </p>
                  {loadingApproval && <LoadingSpinner />}
                </div>
              </div>
            )}
            {loadingApproval && (
              <div className="flex flex-row text-center place-content-center mt-8">
                <p className="text-md text-gray-600 dark:text-gray-300">
                  {loadingMessage}
                </p>
                {loadingApproval && <LoadingSpinner />}
              </div>
            )}
          </div>
        </div>
      )}
      {canGoBack() && (
        <div
          className="text-center hover:cursor-pointer dark:text-gray-600 text-gray-300 mt-3"
          onClick={() => handleBack()}
        >
          <p>Back</p>
        </div>
      )}
    </div>
  );
};

export default LoginCardWithOptions;

function LocalAccountOption(params: {
  account: LocalAccount;
  clickHandler: (account: LocalAccount) => any;
}) {
  const { account, clickHandler } = params;
  return (
    <AccountOption clickHandler={() => clickHandler(account)}>
      <div className="">
        {account.email
          ? account.email
          : account.uid
          ? trimUid(account.uid)
          : "Unknown"}
      </div>
      <div className="flex-grow">
        <AiOutlineArrowRight className="text-right text-xl float-right my-auto group-hover:scale-x-150 transition duration-300 ease-in-out" />
      </div>
    </AccountOption>
  );
}

function AccountOption(props: { children: any; clickHandler?: any }) {
  const { clickHandler, children } = props;
  return (
    <div
      className="flex flex-row space-x-2 hover:bg-green-100/20 hover:dark:bg-green-900/20 group px-3 py-3 hover:cursor-pointer"
      onClick={clickHandler}
    >
      {children}
    </div>
  );
}
