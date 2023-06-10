import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import toast, { Toaster } from "react-hot-toast";
import Divider from "../../components/Divider";
import { useKryptikThemeContext } from "../../components/ThemeProvider";
import Link from "next/link";
import NavProfile from "../../components/navbars/NavProfile";
import PassKeyRegistration from "../../components/auth/PasskeyRegistration";
import PassKeyList from "../../components/auth/PasskeyList";

const Settings: NextPage = () => {
  const { authUser, signOut, kryptikWallet } = useKryptikAuthContext();
  const [passkeyRefreshCount, setPasskeyRefreshCount] = useState(0);
  const { updateIsDark, isDark, updateIsAdvanced, isAdvanced } =
    useKryptikThemeContext();
  const router = useRouter();

  const handleLogout = function () {
    try {
      signOut();
      router.push("/");
    } catch (e) {
      toast.error("Unable to sign out. Please contact support.");
    }
  };

  const handleUpdateIsAdvanced = function (newIsAdvanced: boolean) {
    if (!authUser) {
      toast.error("Please login before updating your preferences");
      return;
    }
    updateIsAdvanced(newIsAdvanced, authUser.uid);
    if (newIsAdvanced) {
      toast.success("Advanced mode activated!");
    } else {
      toast.success("Profile updated!");
    }
  };

  function handlePasskeySuccess() {
    toast.success("Passkey added.");
    setPasskeyRefreshCount(passkeyRefreshCount + 1);
    return;
  }

  function handlePasskeyFailure() {
    toast.error("Unable to add passkey.");
    return;
  }

  return (
    <div>
      <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="lg:px-[30%]">
        <h1 className="text-4xl font-bold sans mb-5 dark:text-white">
          Settings
        </h1>
        <Divider />
        <p className="mb-2 text-justify text-green-500 dark:text-green-600">
          Your Kryptik wallet settings will be managed on this page.
        </p>

        {/* dark mode stereo */}

        <div className="hover:bg-gray-100 hover:dark:bg-[#141414] py-4 rounded px-1">
          <h1 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1 text-left">
            Kryptik Theme
          </h1>

          <div className="flex mb-2">
            <div
              className="form-check form-check-inline"
              onClick={() => updateIsDark(false)}
            >
              <input
                className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-sky-500 checked:border-sky-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadioLight"
                value="light"
                onChange={() => {}}
                checked={isDark ? false : true}
              />
              <label
                className="form-check-label inline-block text-gray-800 dark:text-slate-200"
                htmlFor="inlineRadioLight"
              >
                Light
              </label>
            </div>

            <div
              className="form-check form-check-inline ml-4"
              onClick={() => updateIsDark(true)}
            >
              <input
                className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-sky-500 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadioDark"
                value="dark"
                onChange={() => {}}
                checked={isDark ? true : false}
              />
              <label
                className="form-check-label inline-block text-gray-800 dark:text-slate-200"
                htmlFor="inlineRadioDark"
              >
                Dark
              </label>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            Switch between stealthy night mode and <em>clean as a dream</em>{" "}
            light mode.
          </p>
        </div>

        {/* advanced mode toggle */}
        <div className="hover:bg-gray-100 hover:dark:bg-[#141414] py-4 rounded px-1">
          <h2 className="font-bold text-gray-500 dark:text-gray-400 mb-1">
            Advanced Mode
          </h2>
          <label className="inline-flex relative items-center cursor-pointer mt-2 mb-2">
            <input
              type="checkbox"
              checked={isAdvanced ? true : false}
              id={isAdvanced ? "checked-toggle" : "default-toggle"}
              className="sr-only peer"
              onChange={() => {}}
              onClick={() => handleUpdateIsAdvanced(!isAdvanced)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-blue-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-500"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Advanced Mode
            </span>
          </label>
          <p className="text-slate-500 text-sm">
            Advanced mode will allow you to interact with testnets and set
            custom transaction fees.
          </p>
        </div>
        <div className="hover:bg-gray-100 hover:dark:bg-[#141414] pb-4 rounded px-1">
          <PassKeyList refreshCount={passkeyRefreshCount} />
          <PassKeyRegistration
            onFailure={handlePasskeyFailure}
            onSuccess={handlePasskeySuccess}
          />
        </div>

        <Divider />
        <button
          onClick={() => handleLogout()}
          className="bg-transparent hover:bg-red-500 text-black-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded my-5 dark:text-white"
        >
          Logout
        </button>
        <br />
        <Link href="../wallet/delete">
          <p className="text-red-500 mb-4 text-sm hover:cursor-pointer">
            Delete Wallet
          </p>
        </Link>
        <Link href="../support/privacy">
          <p className="text-sky-500 text-sm hover:cursor-pointer">Privacy</p>
        </Link>
        <Link href="../support/terms">
          <p className="text-sky-500 text-sm hover:cursor-pointer">
            Terms of Use
          </p>
        </Link>
      </div>

      <div className="h-[7rem]">
        {/* padding div for space between top and main elements */}
      </div>
      <NavProfile />
    </div>
  );
};

export default Settings;
