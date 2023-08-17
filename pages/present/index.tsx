import { use, useEffect, useState } from "react";
import { ColorEnum, createColorString } from "../../src/helpers/utils";
import { set } from "lodash";
import Image from "next/image";
import ListFeatures from "../../components/lists/ListFeatures";
import { AnimatePresence, motion } from "framer-motion";

enum Slide {
  Title = 0,
  Team = 1,
  Problem = 2,
  Solution = 3,
  Advantages = 4,
  Action = 5,
}

export default function Home() {
  const [slide, setSlide] = useState<Slide>(Slide.Title);
  const [primaryBgColor, setPrimaryBgColor] = useState<string>("white");
  const [lastKeyboardEvent, setLastKeyboardEvent] =
    useState<KeyboardEvent | null>();
  function nextSlide() {
    if (slide == Slide.Action) return;
    setSlide((prev) => prev + 1);
  }
  function prevSlide() {
    if (slide == Slide.Title) return;
    setSlide((prev) => prev - 1);
  }
  function keypadHandler(event: KeyboardEvent) {
    console.log(event);
    if (event.defaultPrevented) {
      return;
    }
    setLastKeyboardEvent(event);
    event.preventDefault();
  }

  function updatePrimaryBgColor() {
    console.log("updating color");
    switch (slide) {
      case Slide.Title:
        // sky blue
        setPrimaryBgColor("white");
        break;
      case Slide.Problem:
        setPrimaryBgColor("#e66465");
        break;
      case Slide.Solution:
        // clean green
        setPrimaryBgColor("#6bf178");
        break;
      case Slide.Team:
        // nice yellow
        setPrimaryBgColor("#f7d06b");
        break;
      case Slide.Advantages:
        setPrimaryBgColor("#56ccf2");
        break;
      case Slide.Action:
        setPrimaryBgColor("white");
        break;
    }
  }

  useEffect(() => {
    updatePrimaryBgColor();
  }, [slide]);

  useEffect(() => {
    if (!lastKeyboardEvent) return;
    if (lastKeyboardEvent.code === "ArrowLeft") {
      prevSlide();
    } else if (lastKeyboardEvent.code === "ArrowRight") {
      nextSlide();
    }
  }, [lastKeyboardEvent]);

  useEffect(() => {
    if (!window) return;
    window.addEventListener("keydown", keypadHandler, true);
  }, []);

  return (
    <div
      className={`h-[100vh] text-xl w-full`}
      style={{
        background: `radial-gradient(farthest-corner at 40px 40px, white 50%, ${primaryBgColor} 100%)`,
      }}
    >
      <VertcialPadding />
      {slide == Slide.Title && <TitleCard />}
      {slide == Slide.Problem && <ProblemCard />}
      {slide == Slide.Team && <TeamCard />}
      {slide == Slide.Solution && <SolutionCard />}
      {slide == Slide.Advantages && <AdvantagesCard />}
      {slide == Slide.Action && <ActionCard />}
    </div>
  );
}

function VertcialPadding(params: { size?: number }) {
  const { size } = params;
  const amountToPad = size || 4;
  return <div style={{ height: `${amountToPad}vh` }}></div>;
}

function TitleCard() {
  return (
    <SlideContainer>
      <VertcialPadding size={20} />
      <h1 className="text-7xl font-bold text-center">
        Kryptik is a powerful digital wallet
      </h1>
    </SlideContainer>
  );
}

function SolutionCard() {
  return (
    <SlideContainer>
      <SlideTitle
        title="Kryptik Web Wallet"
        subtitle="The Magic Link Between You and (any) Web3 App"
        category="Solution"
        categoryColor={ColorEnum.green}
      />
      <div className="flex flex-col md:flex-row">
        <Image
          src="/icons/chainLogos.gif"
          alt="Wavy chain logos"
          className="object-contain"
          width={200}
          height={200}
        />
        <Image
          src="/kryptikBrand/kryptik balance screen.webp"
          alt="Kryptik sample screen"
          className="mx-auto object-contain"
          width={300}
          height={300}
        />
      </div>
    </SlideContainer>
  );
}

function ActionCard() {
  return (
    <SlideContainer>
      <SlideTitle
        title="Join the Movement"
        subtitle="Create your Kryptik wallet today"
        categoryColor={ColorEnum.blue}
      />
      <Image
        src="/kryptikBrand/qr.png"
        alt="Kryptik logo"
        className="mx-auto object-contain"
        width={300}
        height={300}
      />
    </SlideContainer>
  );
}

function ProblemCard() {
  return (
    <SlideContainer>
      <SlideTitle
        title="Web3 has a complexity problem"
        subtitle="User experience is fragmented and confusing"
        category="Problem"
        categoryColor={ColorEnum.red}
      />
      <div className="flex flex-col space-y-2 mb-4">
        <div className="rounded-md ring-2 ring-red-500 w-fit">
          <div className="rounded-tr-md rounded-tl-md px-2 py-1 bg-white">
            <h1 className="text-left text-xl font-semibold">Ex: Swap USDC</h1>
          </div>
          {/* list of problems */}
          <ol className="list-decimal list-inside text-2xl dark:text-gray-200 text-gray-700 px-2 bg-red-400/70 pb-2">
            <li>Download Wallet</li>
            <li>Save seedphrase</li>
            <li>Create Exchange Account</li>
            <li>Buy ETH</li>
            <li>Transfer ETH to wallet</li>
            <li>Connect to Uniswap</li>
            <li>Confirm Connection</li>
            <li>Approve Transaction</li>
            <li>Swap ETH for USDC</li>
          </ol>
        </div>
      </div>
      <div>
        <p className="text-gray-700 dark:text-gray-200 text-3xl">
          Too many steps. Too many protocols.
        </p>
      </div>
    </SlideContainer>
  );
}

function AdvantagesCard() {
  return (
    <SlideContainer>
      <SlideTitle
        title="Competitive Advantages"
        subtitle="What sets us apart from the competition"
        category="Advantages"
        categoryColor={ColorEnum.blue}
      />
      <div className="list-disc list-inside text-2xl dark:text-gray-200 text-gray-700 pb-2">
        <li>Fast release Times</li>
        <li>Multichain support</li>
        <li>Login from any device</li>
        <li>Integrated Apps</li>
        <li>Open source</li>
      </div>
    </SlideContainer>
  );
}

function TeamCard() {
  return (
    <SlideContainer>
      <SlideTitle
        title="Who We Are"
        subtitle="Core contributors from the open source community"
        category="Team"
        categoryColor={ColorEnum.yellow}
      />
      <div className="flex flex-row space-x-4 mb-4 rounded-lg bg-gray-400/10 px-2 py-2">
        {/* contributor 1 */}
        <div className="flex flex-col space-y-4 w-1/2">
          <Image
            src="/contributors/jett.png"
            alt="Jett Hays photo"
            width={150}
            height={150}
            className="rounded-full ring-sky-400 ring-2 object-cover"
          />
          <div className="text-2xl">
            <h1 className="text-left font-semibold">Jett Hays</h1>
            {/* list of attributes */}
            <ul className="list-disc list-inside dark:text-gray-200 text-gray-700">
              <li>Carnegie Mellon Senior</li>
              <li>President of the CMU Blockchain Club</li>
            </ul>
          </div>
        </div>
        {/* contributor 2 */}
        <div className="flex flex-col space-y-4 w-1/2 items-center">
          <Image
            src="/contributors/jj.png"
            alt="JJ Brar photo"
            width={150}
            height={150}
            className="rounded-full ring-sky-400 ring-2 object-cover"
          />
          <div className="text-2xl">
            <h1 className="text-left font-semibold">JJ Brar</h1>
            {/* list of attributes */}
            <ul className="list-disc list-inside dark:text-gray-200 text-gray-700">
              <li>Berkeley Senior</li>
              <li>Amazon SWE</li>
            </ul>
          </div>
        </div>
      </div>
      {/* <p className="w-fit rounded-md bg-gray-500/10 px-2 py-2 mt-8">
        We are laser-focused on building high-quality software expressed through
        intuitive design
      </p> */}
    </SlideContainer>
  );
}

function SlideContainer(params: { children: any }) {
  const { children } = params;
  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SlideTitle(params: {
  title: string;
  subtitle?: string;
  category?: string;
  categoryColor: ColorEnum;
}) {
  const { title, subtitle, category, categoryColor } = params;
  const colorToShow = createColorString(categoryColor);
  return (
    <div className="mb-6 flex flex-col space-y-2">
      <div className={`text-white text-lg rounded-md  w-fit`}>
        {category && (
          <div
            className={`py-1 px-2 rounded-md`}
            style={{ opacity: 0.9, backgroundColor: colorToShow }}
          >
            <p>{category}</p>
          </div>
        )}
      </div>
      <div>
        <h1 className="text-4xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-2xl text-gray-700 dark:text-gray-200">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
