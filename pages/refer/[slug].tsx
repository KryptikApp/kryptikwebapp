import { useRouter } from "next/router";
import { PaymentLink } from "@prisma/client";
import Image from "next/image";
import { getAllPaymentLinks, getPaymentLinkById } from "../../prisma/script";
import {
  IPaymentLink,
  convertPaymentLinkType,
} from "../../src/paymentLinks/types";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import toast from "react-hot-toast";
import { Network, defaultNetworks } from "hdseedloop";
import { useState } from "react";
import LoadingSpinner from "../../components/loadingSpinner";
import { KryptikFetch } from "../../src/kryptikFetch";
import { TransactionPublishedData } from "../../src/services/models/transaction";

type Props = {
  paymentLink?: IPaymentLink;
  notFound?: boolean;
};

enum PaymentLinkStatus {
  claimed = 0,
  failure = 1,
  unclaimed = 2,
}

export default function Page({ notFound, paymentLink }: Props) {
  const router = useRouter();
  const { authUser, kryptikWallet, loadingAuthUser } = useKryptikAuthContext();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(
    notFound ? PaymentLinkStatus.failure : PaymentLinkStatus.unclaimed
  );
  const [failureMsg, setFailureMsg] = useState(
    "Unable to claim payment. All tokens have been claimed."
  );
  async function handleClaim() {
    try {
      if (!authUser) {
        toast("Please login to claim tokens.");
        router.push(`/wallet/create?from=${router.asPath}`);
        return;
      }
      if (!paymentLink) {
        toast.error("Payment link not found.");
        return;
      }
      setLoading(true);
      // TODO: remove eth assumption
      const network = defaultNetworks.eth;
      const body = {
        claimCode: paymentLink?.id,
        address: kryptikWallet.seedLoop.getAddresses(network)[0],
      };
      console.log("posting cliam request");
      const result = await KryptikFetch(`/api/refer/claim`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const txPubData: TransactionPublishedData = result.data.txPubdata;
      if (txPubData) {
        setLoading(false);
        setStatus(PaymentLinkStatus.claimed);
        return;
      } else {
        setFailureMsg(result.data.msg);
        throw new Error(result.data);
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      toast.error("Unable to claim payment. Please try again later.");
      setLoading(false);
      setStatus(PaymentLinkStatus.failure);
    }
  }
  return (
    <div>
      {paymentLink && !authUser && !loadingAuthUser && (
        <div
          className={`w-[100vw] md:w-[102vw] h-32 md:h-64 bg-green-500 -mx-4`}
        >
          <img
            src={paymentLink.backgroundImagePath}
            width={"110%"}
            height={"100%"}
            className="object-cover max-w-full max-h-full rounded-br-xl rounded-bl-xl blur-sm"
          />
        </div>
      )}
      <div className="mt-6 max-w-2xl mx-auto relative bg-gradient-to-r from-sky-400/10 to-gray-100/10 background-animate py-2 px-2 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 hover:brightness-15 transition-colors duration-300">
        {notFound && (
          <p className="text-red-500">This payment link is invalid.</p>
        )}
        {paymentLink && status == PaymentLinkStatus.unclaimed && (
          <div className="mt-4">
            {authUser && (
              <img
                src={paymentLink.backgroundImagePath}
                width={20}
                height={20}
                className="object-cover w-12 h-12 rounded-md mx-2 my-auto"
              />
            )}
            <div className="absolute top-12 right-3">
              <div className="px-2 py-1 bg-gray-500/10 rounded-md float-right">
                {paymentLink.claimCount}/{paymentLink.maxClaims}{" "}
                <span className="text-sm text-gray-400 dark:text-gray-700">
                  claimed
                </span>
              </div>
            </div>
            <div className="flex flex-row">
              <h1 className="font-semibold text-left text-5xl">
                {paymentLink?.title}
              </h1>
            </div>
            <div className="flex flex-row space-x-2 my-2 text-xl">
              <p className="font-semibold text-green-400">
                Claim ${paymentLink.amountPerClaimUsd}
              </p>
              <img
                src={paymentLink.tokenImagePath}
                width={20}
                height={20}
                className="object-cover rounded-full mx"
              />
            </div>
            {!authUser && (
              <p className="text-gray-400">
                You may be asked to login, before claiming your tokens.
              </p>
            )}
            {/* claim button */}
            {paymentLink.description != "" && (
              <p className="text-2xl mt-3 mb-6 text-gray-900 dark:text-gray-100">
                {paymentLink.description}
              </p>
            )}
            <button
              onClick={() => handleClaim()}
              className="bg-transparent my-2 w-full hover:bg-green-400 text-green-400 text-xl font-semibold hover:cursor-pointer hover:text-white py-3 px-8 border border-green-400 hover:border-transparent rounded-md animate-colors duration-300 relative"
            >
              Claim
              {loading && (
                <div className="absolute top-2 right-4">
                  <LoadingSpinner />
                </div>
              )}
            </button>
            <button />
          </div>
        )}
        {loading && (
          <p className="text-center mt-4 text-gray-400 dark:text-gray-500 text-md ">
            Approving Claim...
          </p>
        )}
        {paymentLink && status == PaymentLinkStatus.claimed && (
          <div className="mt-4">
            <h1 className="font-semibold text-left text-5xl">
              {paymentLink?.title}
            </h1>
            <div className="flex flex-col space-x-2 my-2 text-xl">
              <p className="font-semibold text-green-400 ml-1">
                You claimed ${paymentLink.amountPerClaimUsd}
              </p>
              <p className="text-2xl mt-3 mb-6 text-gray-900 dark:text-gray-100">
                Your tokens are on the way. this usually takes around 30
                seconds.
              </p>
              <button
                onClick={() => router.push("/explore")}
                className="bg-transparent my-2 w-full hover:bg-sky-400 text-sky-400 text-xl font-semibold hover:cursor-pointer hover:text-white py-3 px-8 border border-sky-400 hover:border-transparent rounded-md animate-colors duration-300"
              >
                Keep exploring
              </button>
            </div>
          </div>
        )}
        {status == PaymentLinkStatus.failure && (
          <div className="mt-4">
            <h1 className="font-semibold text-center text-2xl">{failureMsg}</h1>
          </div>
        )}
      </div>
    </div>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const { slug } = { ...params };
  const body = {
    id: slug,
  };
  const idAsNumber = parseInt(slug);
  if (isNaN(idAsNumber)) {
    return {
      notFound: true,
    };
  }
  const paymentLink: PaymentLink | null = await getPaymentLinkById(idAsNumber);

  if (!paymentLink) {
    return {
      notFound: true,
    };
  }
  const result = convertPaymentLinkType(paymentLink);
  return {
    props: {
      paymentLink: result,
    },
  };
}

export async function getStaticPaths() {
  const paymentLinks: PaymentLink[] = await getAllPaymentLinks();
  const paths = paymentLinks.map((paymentLink) => {
    return {
      params: {
        slug: paymentLink.id.toString(),
      },
    };
  });
  return {
    paths,
    fallback: true,
  };
}
