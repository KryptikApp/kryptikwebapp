import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkRehype from "remark-rehype";
import highlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(remarkMath)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .use(highlight)
    .process(markdown);
  return result.toString();
}
