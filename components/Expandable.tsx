import { useEffect } from "react";

type Props = {
  children: any;
  isOpen: boolean;
};

// TODO: Update to support dynamic headers
export default function Expandable(props: Props) {
  const { children, isOpen } = { ...props };
  const randomId: string = Math.random().toString();
  const expandableId = `${randomId}Expandable`;
  const expandable = document.getElementById(expandableId);

  if (expandable) {
    expandable.style.setProperty(
      "--originalHeight",
      `${expandable.scrollHeight}px`
    );
  }

  return (
    <div
      id={`${expandableId}`}
      className={`flex flex-col expandable ${isOpen && "expand"}`}
    >
      {children}
    </div>
  );
}
