import Link from "next/link";
import { useState } from "react";
import { DocType } from "../../src/helpers/docs/types";
import DevDocPreview from "./devDocPreview";

type Props = {
  categoryName: string;
  description: string;
  docs: DocType[];
  alwaysOpen?: boolean;
  activeSlug: string;
  onDocSelection?: (slug: string) => void;
};

const DocDevCategoryPreview = ({
  categoryName,
  docs,
  description,
  activeSlug,
  alwaysOpen,
  onDocSelection,
}: Props) => {
  const cardDetailsId: string = categoryName + "Details";

  function handleCategoryClicked() {
    // no need for animation plus exandable code below when always open
    if (alwaysOpen) {
      return;
    }
    // expand to show token details when clicked
    const cardInfo = document.getElementById(cardDetailsId);
    if (cardInfo) {
      document.getElementById(cardDetailsId)?.classList.toggle("expand");
    }
    const arrowIcon = document.getElementById("arrowDetails");
    if (arrowIcon) {
      arrowIcon.classList.toggle("down");
    }
  }

  // update height of element to expand when we change all docs data
  const expandableDetails = document.getElementById(cardDetailsId);
  if (expandableDetails) {
    expandableDetails.style.setProperty(
      "--originalHeight",
      `${expandableDetails.scrollHeight}px`
    );
  }

  return (
    <div className="">
      <div
        className="flex flex-row textbalck dark:text-white"
        onClick={() => handleCategoryClicked()}
      >
        <p
          className={`px-2 text-xl font-semibold mb-1 ${
            !alwaysOpen && "hover:cursor-pointer hover:text-sky-400"
          }`}
        >
          {categoryName}
        </p>
        {!alwaysOpen && (
          <div className="flex-grow">
            <div
              id="arrowDetails"
              className="float-right pt-[2px] text-xl rotate text-3xl rounded w-5 h-5 flex"
            >
              <p className="place-self-center">+</p>
            </div>
          </div>
        )}
      </div>
      <div
        id={cardDetailsId}
        className={`${!alwaysOpen && "expandable"} flex flex-col`}
      >
        {docs.map((doc: DocType, index: number) => (
          <DevDocPreview
            activeSlug={activeSlug}
            onSelection={onDocSelection}
            emoji={doc.emoji || undefined}
            title={doc.title}
            slug={doc.slug}
            oneLiner={doc.oneLiner}
            image={doc.image || undefined}
            key={"essentials" + index}
          />
        ))}
      </div>
    </div>
  );
};

export default DocDevCategoryPreview;
