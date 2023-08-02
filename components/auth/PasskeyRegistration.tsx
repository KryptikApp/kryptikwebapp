import { registerPasskey } from "../../src/helpers/auth/passkey";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { useState } from "react";

// params for component are passed in as props
type Props = {
  onSuccess: () => any;
  onFailure: () => any;
};

export default function PassKeyRegistration(props: Props) {
  const { onSuccess, onFailure } = { ...props };
  const { authUser } = useKryptikAuthContext();
  const [loadingRegistration, setLoadingRegistration] = useState(false);

  async function addPasskey() {
    if (!authUser) {
      onFailure();
      return;
    }
    setLoadingRegistration(true);
    const success = await registerPasskey({ email: authUser?.email });
    setLoadingRegistration(false);
    if (success) {
      onSuccess();
    } else {
      onFailure();
    }
  }

  return (
    <div className="">
      <p
        className="text-xl text-sky-400 hover:text-sky-500 hover:font-semibold transition-colors duration-300 hover:cursor-pointer w-fit"
        onClick={addPasskey}
      >
        Add New Key
      </p>
    </div>
  );
}
