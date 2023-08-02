import { NextPage } from "next";
import Button from "../buttons/Button";
import { useState } from "react";
import { useRouter } from "next/router";
import { authenticatePasskey } from "../../src/helpers/auth/passkey";
import { useKryptikAuthContext } from "../KryptikAuthProvider";

// params for component are passed in as props
type Props = {
  onSuccess: () => any;
  onFailure: () => any;
};

export default function PassKeyAuth(props: Props) {
  const { onSuccess, onFailure } = { ...props };
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const { authUser } = useKryptikAuthContext();
  const router = useRouter();

  async function addPasskey() {
    if (!authUser) {
      onFailure();
      return;
    }
    setLoadingRegistration(true);
    const approved = await authenticatePasskey({ email: authUser?.email });
    setLoadingRegistration(false);
    if (approved) {
      onSuccess();
    } else {
      onFailure();
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
}
