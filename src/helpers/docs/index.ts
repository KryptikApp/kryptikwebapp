import fs from 'fs'
import { join } from 'path'
/// <reference path="node_modules\gray-matter\gray-matter.d.ts" />
import matter from 'gray-matter'
import { DocType, DocTypeEnum } from './types'
import { getContributorById } from './contributors'

const docsDirectory = join(process.cwd(), 'docs')
const developerDocsDirectory = join(process.cwd(), 'developerDocs')
const blogDocsDirectory = join(process.cwd(), 'blog')

const defaultFields = [
  "slug",
  "title",
  "lastUpdate",
  "image",
  "oneLiner",
  "content",
  "category",
  "emoji",
  "tags",
  "contributorId"
]

export function getDocSlugs(docEnum:DocTypeEnum) {
  let directory:string;
  switch(docEnum){
    case(DocTypeEnum.Blog):{
      directory = blogDocsDirectory;
      break;
    }
    case(DocTypeEnum.DevDoc):{
      directory = developerDocsDirectory;
      break;
    }
    case(DocTypeEnum.UserDoc):{
      directory = docsDirectory;
      break;
    }
    default:{
      directory = docsDirectory;
      break;
    }
  }
  return fs.readdirSync(directory)
}

// update if we can add more specific type
type Items = {
  [key: string]: any
}

export function getDocBySlug(props:{slug: string,  fields?:string[], docEnum:DocTypeEnum}):DocType {
  const {slug, fields, docEnum} = {...props};
  const realSlug = slug.replace(/\.md$/, '')
  let directory:string;
  switch(docEnum){
    case(DocTypeEnum.Blog):{
      directory = blogDocsDirectory;
      break;
    }
    case(DocTypeEnum.DevDoc):{
      directory = developerDocsDirectory;
      break;
    }
    case(DocTypeEnum.UserDoc):{
      directory = docsDirectory;
      break;
    }
    default:{
      directory = docsDirectory;
      break;
    }
  }
  const fullPath = join(directory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items:Items = {}
  const fieldsToUse:string[] = fields || defaultFields;
  // Ensure only the minimal needed data is exposed
  fieldsToUse.forEach((field) => {
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
  const contributorId:string = items.contributorId || "";
  const contributor = getContributorById(contributorId);
  const docToReturn:DocType = {
    slug: items.slug || "",
    title: items.title ||'',
    lastUpdate: items.lastUpdate || '',
    image: items.image || '',
    emoji: items.emoji || null,
    oneLiner: items.oneLiner || '',
    content: items.content || '',
    category: items.category || '',
    tags: items.tags || null,
    contributor:contributor
  }
  return docToReturn;
}

export function getAllDocs(props:{docEnum:DocTypeEnum, fields?:string[]}):DocType[] {
  const {docEnum} = {...props}


  const slugs = getDocSlugs(docEnum);
  const docs:DocType[] = slugs
    .map((slug) => getDocBySlug({slug: slug, docEnum: docEnum}))
    // sort posts by date in descending order
    // TODO: check efficiency of date operation... maybe store on object?
    .sort((post1, post2) => (new Date(post1.lastUpdate).getTime() > new Date(post2.lastUpdate).getTime()? -1 : 1))
  return docs
}

export function getDocsByCategory(props:{category:string, fields?:string[], docEnum:DocTypeEnum, slugToExclude?:string}):DocType[]{
  const {category, slugToExclude, fields, docEnum} = {...props}
  // TODO: examine efficiency if we call getalldocs this for every page
  const allDocs = getAllDocs({docEnum:docEnum, fields:fields});
  const recommendedDocs = allDocs.filter(d=>d.category.toLowerCase().trim() == category.toLowerCase().trim() 
  && (!slugToExclude || d.slug.toLowerCase().trim() != slugToExclude.toLowerCase().trim()));
  return recommendedDocs;
}