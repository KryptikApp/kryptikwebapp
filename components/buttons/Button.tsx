import {
  ColorEnum,
  createColorString,
  defaultColor,
} from "../../src/helpers/utils";

type Props = {
  clickHandler: () => any;
  color?: ColorEnum;
  isDisabled?: boolean;
  text: string;
};

export default function Button(props: Props) {
  const { color, clickHandler, isDisabled, text } = { ...props };
  console.log(color);
  const colorString =
    color != undefined
      ? createColorString(color)
      : createColorString(defaultColor);
  return (
    <button
      onClick={() => clickHandler()}
      className={`bg-transparent my-2 hover:bg-${colorString} text-${colorString} text-xl font-semibold hover:text-white py-2 px-8 border border-${colorString} hover:border-transparent rounded`}
      disabled={isDisabled}
    >
      {text}
    </button>
  );
}
