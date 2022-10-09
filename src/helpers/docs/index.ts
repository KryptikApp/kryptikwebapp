import fs from 'fs'
import { join } from 'path'
/// <reference path="node_modules\gray-matter\gray-matter.d.ts" />
import matter from 'gray-matter'
import { DocType } from './types'

const docsDirectory = join(process.cwd(), 'docs')
const developerDocsDirectory = join(process.cwd(), 'developerDocs')

export function getDocSlugs(devDocs:boolean=false) {
  const directory = devDocs?developerDocsDirectory:docsDirectory;
  return fs.readdirSync(directory)
}

type Items = {
  [key: string]: string
}

export function getDocBySlug(props:{slug: string, fields: string[], isDevDocs?:boolean}):DocType {
  const {slug, fields, isDevDocs} = {...props};
  const realSlug = slug.replace(/\.md$/, '')
  const directory = isDevDocs?developerDocsDirectory:docsDirectory;
  const fullPath = join(directory, `${realSlug}.md`)
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

export function getAllDocs(props:{fields: string[], isDevDocs?:boolean}):DocType[] {
  const {fields, isDevDocs} = {...props}

  const slugs = getDocSlugs(isDevDocs);
  const docs:DocType[] = slugs
    .map((slug) => getDocBySlug({slug: slug, fields: fields, isDevDocs:isDevDocs}))
    // sort posts by date in descending order
    // TODO: check efficiency of date operation... maybe store on object?
    .sort((post1, post2) => (new Date(post1.lastUpdate).getTime() < new Date(post2.lastUpdate).getTime()? -1 : 1))
  return docs
}

export function getDocsByCategory(props:{category:string, fields:string[], slugToExclude?:string, isDevDocs?:boolean}):DocType[]{
  const {category, fields, slugToExclude, isDevDocs} = {...props}
  // TODO: examine efficiency if we call getalldocs this for every page
  const allDocs = getAllDocs({fields: fields, isDevDocs:isDevDocs});
  const recommendedDocs = allDocs.filter(d=>d.category.toLowerCase().trim() == category.toLowerCase().trim() 
  && (!slugToExclude || d.slug.toLowerCase().trim() != slugToExclude.toLowerCase().trim()));
  return recommendedDocs;
}