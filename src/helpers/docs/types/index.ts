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
    authorAvatar: string|null
    authorRole: string|null
    authorName: string|null
  }

export enum DocTypeEnum{
  Blog = 0,
  DevDoc = 1,
  UserDoc = 2
}