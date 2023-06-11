import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

// wallet SDK helpers
import { useKryptikAuthContext } from "../KryptikAuthProvider";

type Props = {
  children: any;
};

const Menu: NextPage<Props> = (props) => {
  const [isMenuMobile, setMenuMobile] = useState(false);
  const { authUser, walletStatus } = useKryptikAuthContext();
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const { children } = { ...props };

  // change style based on boolean
  const menuWrapperClassName = isMenuMobile
    ? "flex flex-col md:flex-row md:ml-auto mt-3 md:mt-0 min-h-[80vh] rounded-lg bg-[#F2FBFE] z-10 border-sky-500 border bg-gray-50 py-4 pl-4 dark:bg-[#0c0c0c] md:min-h-0 text-2xl space-y-2"
    : "hidden text-xl md:flex flex-col md:flex-row md:ml-auto mt-3 md:mt-0";

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (window.innerWidth < 778) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
      }
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    handleResize();
  }, []);

  return (
    <nav className="py-2 md:py-4 mb-4 px-2">
      <div
        className={`md:px-4 fixed mx-auto md:flex md:items-center top-0 py-2 dark:bg-[#0c0c0c]/90 -mx-4 px-4 z-10 w-full`}
      >
        <div className="flex justify-between items-center hover:cursor-pointer">
          <div onClick={() => setMenuMobile(false)}>
            <Link href="/">
              <span className="font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-green-500 hover:outline-4 hover:outline-blue-400 dark:hover:text-white transition-colors duration-1500">
                Kryptik
              </span>
            </Link>
          </div>
          <button
            id="nav-icon"
            onClick={() => setMenuMobile(!isMenuMobile)}
            type="button"
            className={`inline-flex ${
              isMenuMobile && "open"
            } items-center mt-2 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600`}
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <span className="bg-gray-500 dark:bg-gray-400"></span>
            <span className="bg-gray-500 dark:bg-gray-400"></span>
            <span className="bg-gray-500 dark:bg-gray-400"></span>
          </button>
        </div>
        <AnimatePresence>
          <motion.div
            id="menu"
            className={menuWrapperClassName}
            onClick={() => setMenuMobile(false)}
            animate={isMenuMobile || !isSmallScreen ? "open" : "closed"}
            variants={{
              closed: {
                scale: 0,
                opacity: 0,
                transition: {
                  type: "spring",
                  duration: 5,
                  delayChildren: 0.2,
                  staggerChildren: 0.05,
                },
              },
              open: {
                scale: 1,
                opacity: 1,
                transition: {
                  type: "spring",
                  duration: 0.4,
                  delayChildren: 0.2,
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Menu;

type MenuItemProps = {
  children: any;
};

export function MenuItem(props: MenuItemProps) {
  const { children } = { ...props };
  return (
    <motion.div
      variants={{
        closed: { x: -200, opacity: 0 },
        open: {
          x: 0,
          opacity: 100,
          transition: {
            type: "spring",
            duration: 0.4,
            delayChildren: 0.2,
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
