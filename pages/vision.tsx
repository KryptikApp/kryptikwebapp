import type { NextPage } from "next";

const Vision: NextPage = () => {
  return (
    <div>
      <div className="h-[20vh]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="dark:text-white">
        <div className="max-w-2xl mx-auto px-4 md:px-0">
          <h1 className="text-5xl font-bold sans mb-5">The Vision</h1>
          <p className="leading-loose mb-2 text-xl text-justify">
            Kryptik is not the first crypto wallet and it won’t be the last, but
            after a year of hard work we believe it will be the best. Innovation
            is our slingshot, design is our rock and with enough hard work, we
            believe we can topple the hype and deliver a simple, secure online
            wallet that benefits everyone. This is the Kryptik vision.{" "}
          </p>
        </div>
        <div className="timeline min-h-[1000px]">
          <ul>
            <li>
              <div className="content">
                <h3 className="text-5xl">Integrated Savings </h3>
                <p>
                  Saving crypto should be easy, so we&apos;re integrating yield
                  bearing protocols directly within the Kryptik wallet.
                </p>
              </div>
              <div className="time">
                <h4>Summer 2022</h4>
              </div>
            </li>

            <li>
              <div className="content">
                <h3 className="text-5xl">Crosschain Bridges</h3>
                <p>
                  Kryptik will provide integrated bridge support, so you can
                  easily shift your tokens between blockchains.
                </p>
              </div>
              <div className="time">
                <h4>Fall 2022</h4>
              </div>
            </li>

            <li>
              <div className="content">
                <h3 className="text-5xl">Lens Protocol</h3>
                <p>
                  Kryptik will allow you to create and manage your Web3 social
                  profile and connect with your social graph.
                </p>
              </div>
              <div className="time">
                <h4>Winter 2022</h4>
              </div>
            </li>

            <li>
              <div className="content">
                <h3 className="text-5xl">Bitcoin</h3>
                <p>
                  Bitcoin was the first, but it&apos;s often forgotten. Kryptik
                  will make it simple to interact with Bitcoin and the lightning
                  network.
                </p>
              </div>
              <div className="time">
                <h4>Early 2023</h4>
              </div>
            </li>

            <li>
              <div className="content">
                <h3 className="text-5xl">Mobile App</h3>
                <p>
                  The future of crypto is mobile, so we&apos;re building a
                  powerful mobile app to accompany our convenient web wallet.
                </p>
              </div>
              <div className="time">
                <h4>Winter 2023</h4>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="h-[20vh]">
        {/* padding div for space between bottom and main elements */}
      </div>
    </div>
  );
};

export default Vision;
