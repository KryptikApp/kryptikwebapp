import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import { ColorEnum } from "../../src/helpers/utils";
import Button from "../buttons/Button";
import Divider from "../Divider";

type Props = {
  children: any;
  title: string;
  onAccept: () => any;
  onReject: () => any;
  acceptText?: string;
};

const ConnectionCard: NextPage<Props> = (props) => {
  const { children, title, onAccept, onReject, acceptText } = { ...props };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, translateY: 7 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: 7 }}
        transition={{ duration: 0.18 }}
      >
        {" "}
        <div className="max-w-sm md:max-w-md max-h-screen dark:text-white border border-gray-400 dark:border-gray-500 pt-10 pb-20 mx-auto my-auto px-4 rounded rounded-xl bg-white dark:bg-[#0c0c0c]">
          <div>
            <p className="text-2xl font-semibold text-center">{title}</p>
            <Divider />
          </div>
          {children}
          <div className="mt-2 flex flex-col md:flex-row md:space-x-2">
            <Button
              text="Reject"
              expand={true}
              color={ColorEnum.red}
              clickHandler={onReject}
            />
            <Button
              text={acceptText || "Approve"}
              expand={true}
              color={ColorEnum.green}
              clickHandler={onAccept}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionCard;
