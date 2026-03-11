export interface BookmarkCollection {
  id: string
  name: string
  color: string
  bookmarks_count: number
}

export interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  collection: BookmarkCollection | null
  tags: string[]
  favicon?: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface BookmarkFiltersState {
  search: string
  collection_id: string
  tag: string
}

export interface CreateBookmarkRequest {
  title: string
  url: string
  description?: string
  collection?: string | null
  tags?: string[]
  is_favorite?: boolean
}

export type UpdateBookmarkRequest = Partial<CreateBookmarkRequest>
