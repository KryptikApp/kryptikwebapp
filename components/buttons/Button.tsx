import {
  ColorEnum,
  createColorString,
  defaultColor,
} from "../../src/helpers/utils";
import LoadingSpinner from "../loadingSpinner";

type Props = {
  clickHandler: () => any;
  color?: ColorEnum;
  isDisabled?: boolean;
  isLoading?: boolean;
  expand?: boolean;
  text: string;
};

export default function Button(props: Props) {
  const { color, clickHandler, isDisabled, text, expand, isLoading } = {
    ...props,
  };
  console.log(color);
  const colorString =
    color != undefined
      ? createColorString(color)
      : createColorString(defaultColor);
  return (
    <button
      onClick={() => clickHandler()}
      className={`bg-transparent my-2 ${
        expand ? "w-full" : "w-fit"
      } hover:bg-[${colorString}] text-[${colorString}] text-xl font-semibold hover:cursor-pointer hover:text-white py-2 px-8 border border-[${colorString}] hover:border-transparent rounded`}
      style={{ backgroundColor: colorString }}
      disabled={isDisabled}
    >
      <div className={` ${isLoading && "flex flex-row"}`}>
        <div className={`${isLoading && "flex-1"}`}></div>
        <div className={`${isLoading && "flex-2"}`}>{text}</div>
        {isLoading && (
          <div className={isLoading && "flex-1"}>
            <LoadingSpinner />
          </div>
        )}
      </div>
    </button>
  );
}
