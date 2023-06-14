import type { NextPage } from "next";
import LoginWithSeedCard from "../../components/auth/LoginWithSeedCard";

const ImportSeed: NextPage = () => {
  // const { signInWithToken } = useKryptikAuthContext();
  // const [seed, setSeed] = useState("");
  // const [email, setEmail] = useState("");
  // const [isLoading, setisLoading] = useState(false);
  // const [loadingMessage, setLoadingMessage] = useState("");

  // const router = useRouter();

  // const handleSeed = function (seedIn: string) {
  //   setSeed(seedIn);
  // };

  // const waitListErrorHandler = function (msg: string) {
  //   console.warn(msg);
  // };

  // const handleLoginUserWithSeed = async function () {
  //   if (!isValidEmailAddress(email)) {
  //     toast.error("Please enter a valid email");
  //     return;
  //   }
  //   if (!validateAndFormatMnemonic(seed)) {
  //     toast.error("Invalid seed phrase");
  //     return;
  //   }
  //   setisLoading(true);
  //   const isOnTestList = await isOnAlphaTestList(email);
  //   if (!isOnTestList) {
  //     const newPosition = await addEmailToWaitlist(email, waitListErrorHandler);
  //     router.push("../support/testing");
  //     setisLoading(false);
  //     return;
  //   }
  //   try {
  //     toast.success("Kryptik Wallet connected.");
  //     // If we reach this line, it means our
  //     // authentication succeeded, so we'll
  //     // redirect to the home page!
  //     setisLoading(false);
  //     router.push("/");
  //     setisLoading(false);
  //   } catch (e) {
  //     toast.error("Unable to connect Kryptik wallet. Please contact support.");
  //     setisLoading(false);
  //   }
  // };

  // const handleStatusUpdate = function (msg: string) {
  //   setLoadingMessage(msg);
  // };

  return (
    <div>
      <div className="h-[15vh]">
        {/* padding div for space between top and main elements */}
      </div>
      <div className="max-w-2xl mx-auto">
        <LoginWithSeedCard />
      </div>
    </div>
  );
};

export default ImportSeed;
