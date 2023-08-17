import { ColorEnum } from "../../src/helpers/utils";
import Button from "./Button";

type Props = {
  clickHandler: () => any;
  color?: ColorEnum;
  isDisabled?: boolean;
  isLoading?: boolean;
  text: string;
};

export default function ButtonSync(props: Props) {
  const { color, clickHandler, isDisabled, text, isLoading } = { ...props };
  return (
    <Button
      clickHandler={clickHandler}
      text={text}
      color={color}
      isDisabled={isDisabled}
      isLoading={isLoading}
      expand={true}
    />
  );
}
