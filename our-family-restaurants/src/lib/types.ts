export const CATEGORIES = ['한식', '중식', '일식', '양식', '고기', '치킨', '분식', '카페', '디저트', '기타'] as const
export type Category = (typeof CATEGORIES)[number]
export type SortOption = 'recent' | 'rating_desc' | 'rating_asc' | 'name' | 'visited'

export type Profile = {
  id: string
  display_name: string
  avatar_path: string | null
  email: string | null
  approved: boolean
  avatarUrl?: string
}

export type Restaurant = {
  id: string
  name: string
  address: string | null
  phone: string | null
  category: Category | string | null
  memo: string | null
  naver_map_url: string | null
  kakao_map_url: string | null
  website_url: string | null
  created_by: string
  created_at: string
}

export type RestaurantImage = {
  id: string
  restaurant_id: string
  path: string
  is_cover: boolean
  uploaded_by: string
  created_at: string
  signedUrl?: string
}

export type Review = {
  id: string
  restaurant_id: string
  user_id: string
  rating: number
  comment: string | null
  visit_date: string | null
  created_at: string
  updated_at: string
  profile?: Profile
  images?: ReviewImage[]
}

export type ReviewImage = {
  id: string
  review_id: string
  path: string
  uploaded_by: string
  created_at: string
  signedUrl?: string
}

export type Favorite = {
  id: string
  restaurant_id: string
  user_id: string
  created_at: string
}

export type Visit = {
  id: string
  restaurant_id: string
  visit_date: string
  note: string | null
  created_by: string
  created_at: string
  attendee_ids: string[]
}

export type RestaurantView = Restaurant & {
  images: RestaurantImage[]
  reviews: Review[]
  favoriteCount: number
  familyAverage: number | null
  lastVisit: string | null
  visitCount: number
  isFavorite: boolean
}

export type ProfileDraft = {
  display_name: string
  avatarFile?: File | null
}
