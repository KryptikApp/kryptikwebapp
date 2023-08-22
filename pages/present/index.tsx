import { useEffect, useState } from "react";
import { ColorEnum, createColorString } from "../../src/helpers/utils";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useKryptikThemeContext } from "../../components/ThemeProvider";

enum Slide {
  Title = 0,
  Team = 1,
  Problem = 2,
  Solution = 3,
  Features = 4,
  Demo = 5,
  Advantages = 6,
  Action = 7,
}

export default function Home() {
  const [slide, setSlide] = useState<Slide>(Slide.Title);
  const { isDark } = useKryptikThemeContext();
  const defaultBgColor = isDark ? "black" : "white";
  const [primaryBgColor, setPrimaryBgColor] = useState<string>(defaultBgColor);

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
        setPrimaryBgColor(defaultBgColor);
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
      case Slide.Features:
        const newColor = createColorString(ColorEnum.purple);
        setPrimaryBgColor(newColor);
        break;
      case Slide.Demo:
        setPrimaryBgColor(defaultBgColor);
        break;
      case Slide.Advantages:
        setPrimaryBgColor("#56ccf2");
        break;
      case Slide.Action:
        setPrimaryBgColor(defaultBgColor);
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
      className={`h-[100vh] text-xl w-full mx-2`}
      style={{
        background: `radial-gradient(farthest-corner at 100px 100px, ${defaultBgColor} 60%, ${primaryBgColor} 100%)`,
      }}
    >
      <VertcialPadding />
      {slide == Slide.Title && <TitleCard />}
      {slide == Slide.Problem && <ProblemCard />}
      {slide == Slide.Team && <TeamCard />}
      {slide == Slide.Solution && <SolutionCard />}
      {slide == Slide.Features && <FeaturesCard />}
      {slide == Slide.Demo && <DemoCard />}
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
      <VertcialPadding size={15} />
      <div className="flex flex-col space-y-2">
        <div className="flex flex-row space-x-2 mx-auto w-fit rounded-xl border border-gray-500 ">
          <Image
            src="/kryptikBrand/kryptikKGradient.png"
            alt="kryptik logo"
            width={30}
            height={30}
            className="object-contain rounded-full ml-2 "
          />
          <div className=" font-semibold text-2xl bg-red-400 py-2 px-4 rounded-tr-xl rounded-br-xl bg-sky-400/60 relative z-1">
            <span className="z-20">Kryptik</span>
            <div className="w-full backdrop-hue-rotate-15 h-full absolute top-0 left-0 rounded-tr-xl rounded-br-xl animate-scale-x-loop origin-left" />
          </div>
        </div>

        <h1 className="text-7xl font-bold text-center">The Web3 Super App</h1>
      </div>
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
        title="Web3 is Too Complex"
        subtitle="User experience is fragmented and confusing"
        category="Problem"
        categoryColor={ColorEnum.red}
      />
      <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 space-y-4 md:space-y-0">
        <p className="text-gray-700 dark:text-gray-200 text-2xl">
          Too many steps. Too many protocols.
        </p>
        <div className="flex flex-col space-y-2 mb-4">
          <div className="rounded-md ring-2 ring-red-500 w-fit">
            <div className="rounded-tr-md rounded-tl-md px-2 py-1 bg-white">
              <h1 className="text-left text-xl font-semibold dark:text-black">
                Ex: Swap USDC
              </h1>
            </div>
            {/* list of problems */}
            <ol className="list-decimal list-inside text-2xl dark:text-gray-100 text-gray-900 px-2 bg-gradient-to-r from-orange-400 to-red-400 pb-2">
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
      </div>

      <div></div>
    </SlideContainer>
  );
}

function FeaturesCard() {
  return (
    <SlideContainer>
      <SlideTitle
        title="The App You Never Need to Leave"
        subtitle=""
        category="Features"
        categoryColor={ColorEnum.purple}
      />
      <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 space-y-4 md:space-y-0">
        <p className="text-gray-700 dark:text-gray-200 text-2xl">
          Send, save, and swap from a single interface.
        </p>
        <div className="w-full border border-gray-500 flex flex-row bg-gray-500/10 rounded-xl">
          <div className="w-1/2 bg-sky-400/10 ">
            <p className="w-full rounded-tl-xl bg-purple-500/50 text-center">
              Identity
            </p>
            <div className="list-disc list-inside text-2xl dark:text-gray-200 text-gray-700 pb-2 px-2">
              <li>Integrated ENS</li>
              <li>NFT Profiles</li>
              <li>
                Chat{" "}
                <span className="px-2 bg-purple-400/20 py-1 rounded-md text-sm">
                  (coming soon)
                </span>
              </li>
            </div>
          </div>
          <div className="w-1/2 bg-green-500/10">
            <p className="w-full rounded-tr-xl bg-purple-500/50 text-center">
              Finance
            </p>
            <div className="list-disc list-inside text-2xl dark:text-gray-200 text-gray-700 pb-2 px-2">
              <li>Pay Friends</li>
              <li>Exchange Assets</li>
              <li>
                Earn Interest{" "}
                <span className="px-2 bg-purple-400/20 py-1 rounded-md text-sm">
                  (coming soon)
                </span>
              </li>
              <li>Bridge Tokens</li>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
}

function DemoCard() {
  return (
    <SlideContainer>
      <SlideTitle
        title="Onboarding Demo"
        category="Demo"
        categoryColor={ColorEnum.green}
      />
      <div className="flex flex-col space-y-2">
        <Image
          src="/demos/login flow passkey.gif"
          alt="Kryptik onboarding demo"
          className="mx-auto object-contain rounded-xl"
          width={500}
          height={500}
        />
        <p className="text-gray-500 text-2xl text-center">
          Users can create a new account in{" "}
          <span className="font-bold">under five seconds</span>.
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
        <li>Fast release times</li>
        <li>Multichain support</li>
        <li>Integrated apps (Uniswap, 0x, Megic Eden, etc.)</li>
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
      <div className="flex flex-col space-y-4 mb-4 rounded-lg bg-gray-400/10 px-2 py-2">
        {/* contributor 1 */}
        <div className="flex flex-row space-x-2">
          <div className="flex flex-row -space-x-2 hover:space-x-2 transition duration-1000">
            <Image
              src="/contributors/jett.png"
              alt="Jett photo"
              width={100}
              height={100}
              className="rounded-full ring-sky-400 ring-1 object-cover"
            />
            <Image
              src="/contributors/jj.png"
              alt="JJ photo"
              width={100}
              height={100}
              className="rounded-full ring-yellow-400 ring-1 object-cover"
            />
            <Image
              src="/contributors/marlonEdwards.png"
              alt="Marlon Edwards photo"
              width={100}
              height={100}
              className="rounded-full ring-purple-400 ring-1 object-cover"
            />
            <Image
              src="/contributors/alexRasskin.jpeg"
              alt="Alex rasskin photo"
              width={100}
              height={100}
              className="rounded-full ring-red-400 ring-1 object-cover"
            />
          </div>
          <p className="text-gray-500 font-semibold my-auto">+2</p>
        </div>
        <p className="text-2xl">
          We are builders and designers from{" "}
          <span className="font-bold text-red-500">Carnegie Mellon</span> and{" "}
          <span className="font-bold text-yellow-500">UC Berkeley</span>.
        </p>
      </div>
    </SlideContainer>
  );
}

function SlideContainer(params: { children: any }) {
  const { children } = params;
  return (
    <div className="max-w-3xl mx-auto">
      <VertcialPadding size={5} />
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
