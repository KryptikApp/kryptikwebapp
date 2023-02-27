import { NextPage } from "next";

interface Props {
  title: string;
  src: string;
  description: string;
}
const DemoCard: NextPage<Props> = (props) => {
  const { title, description, src } = { ...props };
  return (
    <div>
      <h1 className="text-2xl text-sky-400 text-left font-bold sans mb-5">
        {title}
      </h1>
      {/* demo video */}
      <div>
        <iframe
          src={src}
          allow="autoplay; fullscreen; picture-in-picture"
          className="w-full h-[380px] my-0 py-0"
          allowFullScreen
        ></iframe>
      </div>
      <p className="leading-loose my-4 text-xl text-justify dark:text-gray-400">
        {description}
      </p>
    </div>
  );
};

export default DemoCard;
