import { timeElapsedString } from "../../src/helpers/utils/timeUtils";

type Props = {
  dateString: string;
  isPast?: boolean;
};

const DateFormatter = ({ dateString, isPast }: Props) => {
  // default to past date
  if (isPast == undefined) {
    isPast = true;
  }
  const startDate: Date = new Date(dateString.replace(/-/g, "/"));
  const today: Date = new Date();
  const elapsedString = timeElapsedString(startDate, today);
  return (
    <div className="text-gray-800 dark:text-gray-200 rounded-lg px-1 py-1 bg-gray-100 dark:bg-gray-800 max-w-fit">
      <p className="font-semibold">
        {isPast ? elapsedString : startDate.toDateString()}
      </p>
    </div>
  );
};

export default DateFormatter;
