import { NextPage } from "next";
import Collapsible from "react-collapsible";
import { IQuestionAnswer } from "../../src/support/FAQ/models";

interface Props {
  faq: IQuestionAnswer;
}

const FAQ: NextPage<Props> = (props) => {
  const faq = props.faq;
  return (
    <div className="max-w-full bg-gray-50 dark:bg-[#070707] border border-gray-600 dark:border-gray-200 pt-2 pb-4 text-black dark:text-white rounded px-2 hover:border-sky-400 dark:hover:border-sky-400">
      <h1 className="text-xl font-bold text-slate-700 dark:text-slate-100 text-left">
        {faq.question}
      </h1>
      <p className="text-gray-800 dark:text-gray-100 text-lg">{faq.answer}</p>
    </div>
  );
};

export default FAQ;
