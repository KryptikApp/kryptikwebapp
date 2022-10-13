export type DocType = {
    slug: string
    title: string
    lastUpdate: string
    image: string|null
    emoji: string|null
    oneLiner: string
    content: string
    category: string
  }

export enum DocTypeEnum{
  Blog = 0,
  DevDoc = 1,
  UserDoc = 2
}