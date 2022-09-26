import fs from 'fs'
import { join } from 'path'
/// <reference path="node_modules\gray-matter\gray-matter.d.ts" />
import matter from 'gray-matter'

const docsDirectory = join(process.cwd(), 'docs')

export function getDocSlugs() {
  return fs.readdirSync(docsDirectory)
}

type Items = {
  [key: string]: string
}

export function getDocBySlug(slug: string, fields: string[] = []):Items {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(docsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items:Items = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug
    }
    if (field === 'content') {
      items[field] = content
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field]
    }
  })
  return items
}

export function getAllDocs(fields: string[] = []):Items[] {
  const slugs = getDocSlugs()
  const docs = slugs
    .map((slug) => getDocBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return docs
}