import type { NextPage } from "next";
import { Toaster } from "react-hot-toast";

// kryptik imports
import LoginCard from "../../components/auth/LoginCard";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import LoginCardWithOptions from "../../components/auth/LoginCardWithOptions";

const CreateWallet: NextPage = () => {
  const { authUser } = useKryptikAuthContext();
  console.log(authUser);

  return (
    <div>
      <div className="h-[15vh]">
        {/* padding div for space between top and main elements */}
      </div>
      <div className="max-w-2xl mx-auto">
        <LoginCardWithOptions />
      </div>
    </div>
  );
};

export default CreateWallet;
