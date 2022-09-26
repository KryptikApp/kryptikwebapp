import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import html from 'remark-html'

export default async function markdownToHtml(markdown: string) {
  const result = await remark().use(remarkGfm).use(html).process(markdown)
  return result.toString()
}