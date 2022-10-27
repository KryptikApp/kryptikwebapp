export type DocType = {
    slug: string
    title: string
    lastUpdate: string
    image: string|null
    emoji: string|null
    oneLiner: string
    content: string
    category: string
    tags: string[]|null
    // author props
    contributor: Contributor
  }

export enum DocTypeEnum{
  Blog = 0,
  DevDoc = 1,
  UserDoc = 2
}

export type Contributor = {
  id: string
  name: string,
  role: string,
  avatarPath:string
}

export enum ContributorRole{
  Builder = 0,
  Writer = 1
}