import Divider from "../../components/Divider";
import ToDoCard from "../../components/actions/ToDoCard";
import ToDoList from "../../components/actions/ToDoList";

export default function Guide() {
  return (
    <div className="max-w-xl mx-auto px-2">
      <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
      </div>
      <div className="mb-5">
        {" "}
        <h1 className="text-4xl font-bold sans dark:text-white text-left">
          Wallet Guide
        </h1>
        <p className="text-gray-500 text-md">
          Get familiar with your new wallet.
        </p>
        <Divider />
      </div>

      <ToDoList />
    </div>
  );
}
