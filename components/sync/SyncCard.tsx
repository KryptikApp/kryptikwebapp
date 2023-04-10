import { NextPage } from "next";
import { roundToDecimals } from "../../src/helpers/utils/numberUtils";

type Props = {
  children: any;
  title: string;
  onAccept?: () => any;
  progressPercent: number;
  showProgress?: boolean;
  isLoading: boolean;
};

const SyncCard: NextPage<Props> = (props) => {
  const {
    children,
    title,
    onAccept,
    progressPercent,
    isLoading,
    showProgress,
  } = {
    ...props,
  };
  return (
    <div className="m-4 max-w-lg max-h-screen dark:text-white border border-sky-300 pt-8 pb-10 mx-auto my-auto px-4 rounded rounded-lg bg-gray-50 dark:bg-gray-900 hover:border-sky-400 dark:hover:border-sky-400">
      <div className="flex flex-row">
        <h1 className="text-4xl font-bold mb-2">
          Sync
          <img
            src="/kryptikBrand/kryptikEyez.png"
            alt="Kryptik Eyes"
            className="rounded-full w-10 ml-2 inline max-h-sm h-auto align-middle border-none"
          />
        </h1>
        {/* {isLoading && (
          <div className="flex-grow">
            <div className="float-right">
              <LoadingSpinner />
            </div>
          </div>
        )} */}
      </div>
      {/* progress bar */}
      {showProgress == true ||
        (showProgress === undefined && (
          <div className="max-w-full bg-gray-200 dark:bg-[#141414] rounded-full h-6 mx-2 mb-4">
            <div
              id="progressBar"
              className="bg-gradient-to-r from-sky-400 to-sky-600 h-6 rounded-full text-gray-700"
              style={{
                width: `${progressPercent}%`,
                maxWidth: `100%`,
                paddingLeft: "2%",
              }}
            >
              {progressPercent > 5
                ? `${roundToDecimals(progressPercent, 2)}%`
                : ""}
            </div>
          </div>
        ))}

      {children}
    </div>
  );
};

export default SyncCard;
