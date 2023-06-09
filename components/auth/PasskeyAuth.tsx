import { NextPage } from "next";
import Button from "../buttons/Button";
import { useState } from "react";
import { KryptikFetch } from "../../src/kryptikFetch";
import { startAuthentication } from "@simplewebauthn/browser";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

const PassKeyAuth: NextPage = () => {
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const router = useRouter();

  async function addPasskey() {
    setLoadingRegistration(true);

    // try to add new friend on server
    try {
      const res = await KryptikFetch("/api/auth/passkey/createAuthOptions", {
        method: "POST",
        timeout: 8000,
        headers: { "Content-Type": "application/json" },
      });

      let attResp;
      // custom error handling for option generation
      try {
        attResp = await startAuthentication(res.data);
      } catch (e: any) {
        if (e.name && e.name === "InvalidStateError") {
          throw new Error("Passkey already registered.");
        }
        throw new Error(e.message);
      }
      // send the registration credentials to the server
      const resRegistration = await KryptikFetch(
        "/api/auth/passkey/verifyAuth",
        {
          method: "POST",
          body: JSON.stringify(attResp),
          timeout: 8000,
          headers: { "Content-Type": "application/json" },
        }
      );
      const verification = resRegistration.data;
      // ensure that the passkey was registered
      if (verification.verified) {
        toast.success("Logged in.");
        setLoadingRegistration(false);
        router.push("/");
        return;
      } else {
        throw new Error();
      }
    } catch (e: any) {
      toast.error("Unable to add passkey.");
      setLoadingRegistration(false);
    }
  }

  return (
    <div className="hover:border-green-400 transition-colors duration-300 border rounded-xl px-2 py-2 my-2">
      <h1 className="text-3xl font-bold">Passkey Authenticationn</h1>
      <p className="text-xl">Log in.</p>
      <Button
        clickHandler={addPasskey}
        text={"Authenticate"}
        isLoading={loadingRegistration}
      />
    </div>
  );
};

export default PassKeyAuth;
