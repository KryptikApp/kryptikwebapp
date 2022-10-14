import remarkGfm from 'remark-gfm'
import {unified} from 'unified'
import remarkRehype from 'remark-rehype'
import highlight from "rehype-highlight"
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'



export default async function markdownToHtml(markdown: string) {
  const result = await unified().use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify).use(highlight).process(markdown);
  return result.toString()
}