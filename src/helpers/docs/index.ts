import fs from 'fs'
import { join } from 'path'
/// <reference path="node_modules\gray-matter\gray-matter.d.ts" />
import matter from 'gray-matter'
import { DocType } from './types'

const docsDirectory = join(process.cwd(), 'docs')

export function getDocSlugs() {
  return fs.readdirSync(docsDirectory)
}

type Items = {
  [key: string]: string
}

export function getDocBySlug(slug: string, fields: string[] = []):DocType {
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
  const docToReturn:DocType = {
    slug: items.slug || "",
    title: items.title ||'',
    lastUpdate: items.lastUpdate || '',
    image: items.image || '',
    emoji: items.emoji || null,
    oneLiner: items.oneLiner || '',
    content: items.content || '',
    category: items.category || '',
  }
  return docToReturn;
}

export function getAllDocs(fields: string[] = []):DocType[] {
  const slugs = getDocSlugs()
  const docs:DocType[] = slugs
    .map((slug) => getDocBySlug(slug, fields))
    // sort posts by date in descending order
    // TODO: check efficiency of date operation... maybe store on object?
    .sort((post1, post2) => (new Date(post1.lastUpdate).getTime() < new Date(post2.lastUpdate).getTime()? -1 : 1))
  return docs
}

export function getDocsByCategory(category:string, fields:string[] = [], slugToExclude?:string):DocType[]{
  // TODO: examine efficiency if we call getalldocs this for every page
  const allDocs = getAllDocs(fields);
  const recommendedDocs = allDocs.filter(d=>d.category.toLowerCase().trim() == category.toLowerCase().trim() 
  && (!slugToExclude || d.slug.toLowerCase().trim() != slugToExclude.toLowerCase().trim()));
  return recommendedDocs;
}