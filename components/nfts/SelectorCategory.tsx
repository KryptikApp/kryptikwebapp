import {
  ActiveCategory,
  CategoryLengths,
  Length,
} from "../../src/types/category";

interface Props {
  onCategoryClick: (category: ActiveCategory) => void;
  activeCategory: ActiveCategory;
  categoryLength: CategoryLengths;
}
export default function SelectorCategory(props: Props) {
  const { onCategoryClick, activeCategory, categoryLength } = { ...props };

  const solImagePath =
    "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/sol.png?alt=media&token=6d6e8337-79bb-45c6-bb31-47e49c7ce763";
  const nearImagePath =
    "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/near%20logo.png?alt=media&token=244c738f-e138-4e28-bf23-c991b99050c7";
  const ethImagePath =
    "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/eth.png?alt=media&token=cc1091fb-ef28-4008-a91e-5709818c452e";

  return (
    <div className="flex flex-col mx-6">
      <div
        onClick={() => onCategoryClick(ActiveCategory.all)}
        className={`${
          activeCategory == ActiveCategory.all
            ? "bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black"
            : ""
        } flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}
      >
        <span className="w-5 mr-2">🎨</span>
        <h3 className="">All NFTs</h3>
        <DisplayCategoryLength
          length={categoryLength[ActiveCategory.all]}
          isSelected={activeCategory == ActiveCategory.all}
        />
      </div>

      <div
        onClick={() => onCategoryClick(ActiveCategory.eth)}
        className={`${
          activeCategory == ActiveCategory.eth
            ? "bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black"
            : ""
        } flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}
      >
        <img
          className="w-5 h-5 mt-1 rounded-full mr-2 flex-shrink-0"
          src={ethImagePath}
        />
        <h3 className="">Ethereum NFTs</h3>
        <DisplayCategoryLength
          length={categoryLength[ActiveCategory.eth]}
          isSelected={activeCategory == ActiveCategory.eth}
        />
      </div>

      <div
        onClick={() => onCategoryClick(ActiveCategory.sol)}
        className={`${
          activeCategory == ActiveCategory.sol
            ? "bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black"
            : ""
        } flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}
      >
        <img
          className="w-5 h-5 mt-1 rounded-full mr-2 flex-shrink-0"
          src={solImagePath}
        />
        <h3 className="">Solana NFTs</h3>

        <DisplayCategoryLength
          length={categoryLength[ActiveCategory.sol]}
          isSelected={activeCategory == ActiveCategory.sol}
        />
      </div>

      <div
        onClick={() => onCategoryClick(ActiveCategory.near)}
        className={`${
          activeCategory == ActiveCategory.near
            ? "bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black"
            : ""
        } flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}
      >
        <img
          className="w-5 h-5 mt-1 rounded-full mr-2 flex-shrink-0"
          src={nearImagePath}
        />
        <h3 className="">Near NFTs</h3>

        <DisplayCategoryLength
          length={categoryLength[ActiveCategory.near]}
          isSelected={activeCategory == ActiveCategory.near}
        />
      </div>

      <div
        onClick={() => onCategoryClick(ActiveCategory.poaps)}
        className={`${
          activeCategory == ActiveCategory.poaps
            ? "bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black"
            : ""
        } flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}
      >
        <span className="w-5 mr-2">🏷️</span>
        <h3 className="">Proof of Attendance</h3>
        <DisplayCategoryLength
          length={categoryLength[ActiveCategory.poaps]}
          isSelected={activeCategory == ActiveCategory.poaps}
        />
      </div>
    </div>
  );
}

function DisplayCategoryLength(props: { length: Length; isSelected: boolean }) {
  const { length, isSelected } = props;
  const lengthToDisplay = length.isMore ? `${length.length}+` : length.length;
  return (
    <div className={`ml-1 grow text-right`}>
      <span
        className={`${
          isSelected &&
          "bg-slate-400 dark:bg-slate-700 rounded-full w-fit pl-2 pr-2 -mr-2"
        }`}
      >
        {lengthToDisplay}
      </span>
    </div>
  );
}
