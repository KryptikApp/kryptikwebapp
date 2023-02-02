import { useKryptikThemeContext } from "../ThemeProvider";
import DOMPurify from "isomorphic-dompurify";
import { useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

type Props = {
  content: string;
};

const DocContent = ({ content }: Props) => {
  const { isDark } = useKryptikThemeContext();

  // copy and paste when code element is clicked
  // TODO: add visual indication of copy ability before click
  useEffect(() => {
    // finda ll code chunks and add click event handler
    const codeChunks = document.querySelectorAll("code");
    if (!codeChunks) return;
    codeChunks.forEach((c) => {
      c.onclick = () => {
        if (c.textContent) {
          toast.success("Code copied!");
          // write code text to clipboard
          navigator.clipboard.writeText(c.textContent);
        }
      };
    });
  }, []);

  // sanitize incoming content
  const cleanContent = DOMPurify.sanitize(content);
  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="prose dark:prose-invert md:prose-xl prose-blockquote:border-sky-400 prose-code:rounded-md prose-code:hover:cursor-pointer prose-code:scrollbar-thin prose-code:scrollbar-thumb-sky-400 prose-code:scrollbar-track-gray-700 prose-blockquote:rounded-md prose-img:rounded-md prose-a:text-sky-400 prose-li:marker:text-sky-400 prose-quoteless prose-blockquote:not-italic"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </div>
  );
};

export default DocContent;
