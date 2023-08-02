import { useEffect } from "react";

type Props = {
  children: any;
  isOpen: boolean;
  onRequestClose: () => any;
  dark: boolean;
};

// TODO: Update to support dynamic headers
export default function Modal(props: Props) {
  const { children, isOpen, onRequestClose, dark } = { ...props };
  const randomId: string = Math.random().toString();
  const modalId = `${randomId}Modal`;
  const childrenId = `${randomId}Children`;

  useEffect(() => {
    if (!document) return;
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const childrenContent = document.getElementById(childrenId);
    // close modal if you click area outside the children
    modal.addEventListener("click", function (e: any) {
      // if you click the children, don't close the card!
      if (childrenContent?.contains(e.target)) {
        return;
      } else {
        onRequestClose();
      }
    });
  }, []);

  return (
    <div>
      <div
        id={modalId}
        tabIndex={-1}
        aria-hidden={isOpen ? "false" : "true"}
        className={`${
          !isOpen && "hidden"
        } modal fixed w-full h-full top-0 left-0 z-50 flex items-center justify-center overflow-y-auto`}
        style={{
          backgroundColor: `${
            dark ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.9)"
          }`,
        }}
      >
        {/* top right fixed close button  */}
        <button
          type="button"
          className="text-gray-400 z-10  rounded-full text-sm p-1.5 ml-auto fixed top-4 right-5 items-center bg-sky-400/20 dark:bg-white dark:text-black transition ease-in-out hover:scale-110 border"
          onClick={() => onRequestClose()}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <div className="flex flex-col mt-[220px] md:mt-0">
          {/* show wrapped content */}
          <div
            className="m-4 md:min-w-[60%] max-w-[90%] md:max-w-[900px]"
            id={childrenId}
          >
            {children}
            <div className="h-[4%]" />{" "}
            {/* spacer for close button on small screens */}
          </div>
        </div>
      </div>
    </div>
  );
}
