import { NextPage } from "next";
import { ColorEnum } from "../../src/helpers/utils";
import Button from "../buttons/Button";
import Divider from "../Divider";

type Props = {
  children: any;
  title: string;
  onAccept: () => any;
};

const ConnectionCard: NextPage<Props> = (props) => {
  const { children, title, onAccept } = { ...props };
  return (
    <div className="m-4 md:min-w-[60%] max-w-[90%] md:max-w-[400px] max-h-screen dark:text-white border border-gray-400 dark:border-gray-500 pt-10 pb-20 mx-auto my-auto px-4 rounded rounded-lg bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div>
        <p className="text-2xl font-semibold text-center">{title}</p>
        <Divider />
      </div>
      {children}
      <div>
        <Button
          text="Approve"
          color={ColorEnum.green}
          clickHandler={onAccept}
        />
      </div>
    </div>
  );
};

export default ConnectionCard;
