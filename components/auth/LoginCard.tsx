import type { NextPage } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ReactCodeInput from "react-code-input";

import { useRouter } from "next/router";
import { useKryptikThemeContext } from "../ThemeProvider";
import { KryptikFetch } from "../../src/kryptikFetch";
import Link from "next/link";
import { isValidEmailAddress } from "../../src/helpers/resolvers/kryptikResolver";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import LoadingSpinner from "../loadingSpinner";

const LoginCard: NextPage = () => {
  const { signInWithToken } = useKryptikAuthContext();
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectToPath, setRedirectToPath] = useState<null | string>(null);
  const sendLink: boolean = false;
  const { isDark } = useKryptikThemeContext();
  const [code, setCode] = useState("");
  const router = useRouter();
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

  async function handleLogin() {
    const params = {
      email: email,
      sendLink: sendLink,
    };
    if (!isValidEmailAddress(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    // try to login
    // TODO: CREATE SEPERATE LOGIN REQUEST FUNCTION
    try {
      const res = await KryptikFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(params),
        timeout: 8000,
        headers: { "Content-Type": "application/json" },
      });
      if (res.status != 200) {
        toast.error("Unable to login.");
        return;
      }
      setSentEmail(true);
      setLoading(false);
      toast.success("Email sent!");
      return;
    } catch (e) {
      setLoading(false);
      // adding events failed. notfy user.
      toast("Unable to send varification email.");
      return;
    }
  }

  function handleEmailChange(newEmail: string) {
    setEmail(newEmail);
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

  return (
    <div className="dark:text-white">
      <div className="bg-[#FBFDFD] dark:bg-gradient-to-br dark:to-[#0d0d0d] dark:from-[#0c0c0c] max-w-md mx-auto rounded-lg border border-solid dark:border-gray-800 border-gray-100 hover:dark:border-green-400 drop-shadow dark:text-white pt-2 px-2 pb-10 min-h-[280px]">
        <div className="flex flex-row mt-1">
          <div className="w-10 my-auto">
            <img src="/kryptikBrand/kryptikEyez.png" className="rounded-full" />
          </div>
          <h2 className="font-bold text-md ml-2 mb-1 text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-green-500">
            Kryptik
          </h2>
        </div>
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-center mb-4">Welcome</h1>
        </div>
        <div className="">
          {!sentEmail && loading && (
            <div>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 text-center">
                Sending email...
              </p>
            </div>
          )}
          {!loading && !sentEmail && (
            <div className="px-6">
              <div className="flex flex-col mb-4">
                <p className="text-gray-700 dark:text-gray-400 text-lg font-semibold mb-4">
                  Create your secure, Web3 wallet in one click.
                </p>
                <input
                  type="email"
                  className="bg-gray-200 dark:bg-gray-700 appearance-none border border-gray-200 rounded w-full py-3 px-4 text-gray-800 dark:text-white leading-tight focus:outline-none focus:bg-white focus:border-sky-400 dark:focus:border-sky-500 text-2xl"
                  id="inline-full-name"
                  placeholder="Enter your email"
                  required
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
                <button
                  onClick={() => handleLogin()}
                  className={`bg-transparent hover:bg-green-500 text-green-500 text-2xl font-semibold hover:text-white py-2 px-4 ${
                    loading || sentEmail ? "hover:cursor-not-allowed" : ""
                  } border border-green-500 hover:border-transparent rounded-lg mt-5 mb-2`}
                  disabled={loading || sentEmail}
                >
                  Create Wallet
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
          {!loading && sentEmail && !loadingApproval && (
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
    </div>
  );
};

export default LoginCard;
