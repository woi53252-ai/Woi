import { supabase } from './supabase'
import type { Favorite, Profile, Restaurant, RestaurantImage, Review, ReviewImage, Visit } from './types'
import { photoFileError, storageExt } from './utils'

export async function getMyProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data as Profile
}

export async function getFamilyProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').eq('approved', true).order('display_name')
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function getRestaurants() {
  const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Restaurant[]
}

export async function getRestaurantImages() {
  const { data, error } = await supabase.from('restaurant_images').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as RestaurantImage[]
}

export async function getReviews() {
  const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Review[]
}

export async function getReviewImages() {
  const { data, error } = await supabase.from('review_images').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ReviewImage[]
}

export async function getFavorites() {
  const { data, error } = await supabase.from('favorites').select('*')
  if (error) throw error
  return (data ?? []) as Favorite[]
}

export async function getVisits() {
  const { data, error } = await supabase.from('visits').select('*').order('visit_date', { ascending: false })
  if (error) throw error
  const visits = (data ?? []) as Omit<Visit, 'attendee_ids'>[]
  if (!visits.length) return [] as Visit[]

  const { data: attendees, error: attendeeError } = await supabase.from('visit_attendees').select('visit_id,user_id')
  if (attendeeError) throw attendeeError
  const byVisit = new Map<string, string[]>()
  for (const attendee of attendees ?? []) {
    const list = byVisit.get(attendee.visit_id) ?? []
    list.push(attendee.user_id)
    byVisit.set(attendee.visit_id, list)
  }
  return visits.map((visit) => ({ ...visit, attendee_ids: byVisit.get(visit.id) ?? [] })) as Visit[]
}

export async function signedUrl(path: string) {
  const { data, error } = await supabase.storage.from('family-images').createSignedUrl(path, 60 * 60 * 4)
  if (error) throw error
  return data.signedUrl
}

export async function uploadPhoto(file: File, folder: string) {
  const errorMessage = photoFileError(file)
  if (errorMessage) throw new Error(errorMessage)
  const path = `${folder}/${crypto.randomUUID()}.${storageExt(file)}`
  const { error } = await supabase.storage.from('family-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error
  return path
}

type RestaurantFields = Omit<Restaurant, 'id' | 'created_at' | 'created_by'>

export async function createRestaurant(input: RestaurantFields & { created_by: string }, coverFile?: File | null) {
  const { data, error } = await supabase.from('restaurants').insert(input).select().single()
  if (error) throw error
  const restaurant = data as Restaurant

  if (coverFile) {
    try {
      const path = await uploadPhoto(coverFile, `restaurants/${restaurant.id}`)
      const { error: imageError } = await supabase.from('restaurant_images').insert({
        restaurant_id: restaurant.id,
        path,
        is_cover: true,
        uploaded_by: input.created_by,
      })
      if (imageError) throw imageError
    } catch (imageError) {
      await supabase.from('restaurants').delete().eq('id', restaurant.id)
      throw imageError
    }
  }

  return restaurant
}

export async function updateRestaurant(
  restaurantId: string,
  userId: string,
  input: RestaurantFields,
  coverFile?: File | null,
) {
  let newCoverPath: string | null = null

  if (coverFile) newCoverPath = await uploadPhoto(coverFile, `restaurants/${restaurantId}`)

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(input)
      .eq('id', restaurantId)
      .eq('created_by', userId)
      .select()
      .single()
    if (error) throw error

    if (newCoverPath) {
      const { error: unmarkError } = await supabase
        .from('restaurant_images')
        .update({ is_cover: false })
        .eq('restaurant_id', restaurantId)
        .eq('is_cover', true)
      if (unmarkError) throw unmarkError

      const { error: insertError } = await supabase.from('restaurant_images').insert({
        restaurant_id: restaurantId,
        path: newCoverPath,
        is_cover: true,
        uploaded_by: userId,
      })
      if (insertError) throw insertError
    }

    return data as Restaurant
  } catch (error) {
    if (newCoverPath) await supabase.storage.from('family-images').remove([newCoverPath])
    throw error
  }
}

async function removeStoragePaths(paths: string[]) {
  const uniquePaths = [...new Set(paths.filter(Boolean))]
  for (let index = 0; index < uniquePaths.length; index += 100) {
    const chunk = uniquePaths.slice(index, index + 100)
    const { error } = await supabase.storage.from('family-images').remove(chunk)
    if (error) return { error }
  }
  return { error: null }
}

export async function deleteRestaurant(restaurantId: string, userId: string) {
  const { data: imageRows, error: imageError } = await supabase
    .from('restaurant_images')
    .select('path, uploaded_by')
    .eq('restaurant_id', restaurantId)
  if (imageError) throw imageError

  const { data: reviewRows, error: reviewError } = await supabase
    .from('reviews')
    .select('id')
    .eq('restaurant_id', restaurantId)
  if (reviewError) throw reviewError

  const reviewIds = (reviewRows ?? []).map((review) => review.id)
  let reviewImageRows: Array<{ path: string; uploaded_by: string }> = []
  if (reviewIds.length) {
    const { data, error } = await supabase.from('review_images').select('path, uploaded_by').in('review_id', reviewIds)
    if (error) throw error
    reviewImageRows = (data ?? []) as Array<{ path: string; uploaded_by: string }>
  }

  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', restaurantId)
    .eq('created_by', userId)
  if (error) throw error

  // DB 삭제가 성공한 뒤, 현재 사용자가 소유한 Storage 파일만 정리합니다.
  // 다른 가족이 올린 사진은 Storage 소유권 때문에 삭제하지 않고 private 상태로 남겨둡니다.
  const ownPaths = [
    ...(imageRows ?? []).filter((image) => image.uploaded_by === userId).map((image) => image.path),
    ...reviewImageRows.filter((image) => image.uploaded_by === userId).map((image) => image.path),
  ]
  if (ownPaths.length) await removeStoragePaths(ownPaths)
}

export async function createReview(input: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'profile' | 'images'>, photos: File[]) {
  const { data, error } = await supabase.from('reviews').upsert(input, { onConflict: 'restaurant_id,user_id' }).select().single()
  if (error) throw error
  const review = data as Review

  if (photos.length) {
    const paths: string[] = []
    try {
      for (const file of photos) paths.push(await uploadPhoto(file, `reviews/${review.id}`))
      const { error: imageError } = await supabase.from('review_images').insert(paths.map((path) => ({ review_id: review.id, path, uploaded_by: input.user_id })))
      if (imageError) throw imageError
    } catch (photoError) {
      for (const path of paths) await supabase.storage.from('family-images').remove([path])
      throw photoError
    }
  }

  return review
}

export async function deleteReview(review: Review) {
  const { data: images, error: imageError } = await supabase.from('review_images').select('path').eq('review_id', review.id)
  if (imageError) throw imageError
  const paths = (images ?? []).map((image) => image.path)
  const { error } = await supabase.from('reviews').delete().eq('id', review.id)
  if (error) throw error
  if (paths.length) await supabase.storage.from('family-images').remove(paths)
}

export async function addRestaurantImage(restaurantId: string, userId: string, file: File) {
  const path = await uploadPhoto(file, `restaurants/${restaurantId}`)
  const { data, error } = await supabase.from('restaurant_images').insert({ restaurant_id: restaurantId, path, is_cover: false, uploaded_by: userId }).select().single()
  if (error) {
    await supabase.storage.from('family-images').remove([path])
    throw error
  }
  return data as RestaurantImage
}

export async function toggleFavorite(userId: string, restaurantId: string, currentlyFavorite: boolean) {
  if (currentlyFavorite) {
    const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('restaurant_id', restaurantId)
    if (error) throw error
    return
  }
  const { error } = await supabase.from('favorites').insert({ user_id: userId, restaurant_id: restaurantId })
  if (error && error.code !== '23505') throw error
}

export async function createVisit(restaurantId: string, userId: string, visitDate: string, attendeeIds: string[], note: string) {
  const { data, error } = await supabase.from('visits').insert({ restaurant_id: restaurantId, created_by: userId, visit_date: visitDate, note: note.trim() || null }).select().single()
  if (error) throw error
  const visitId = data.id as string
  const { error: attendeeError } = await supabase.from('visit_attendees').insert(attendeeIds.map((attendeeId) => ({ visit_id: visitId, user_id: attendeeId })))
  if (attendeeError) {
    await supabase.from('visits').delete().eq('id', visitId)
    throw attendeeError
  }
  return data as Visit
}

export async function updateMyProfile(userId: string, displayName: string, avatarFile?: File | null) {
  let avatarPath: string | null | undefined = undefined
  if (avatarFile) avatarPath = await uploadPhoto(avatarFile, `avatars/${userId}`)
  const update: Record<string, unknown> = { display_name: displayName.trim() }
  if (avatarPath) update.avatar_path = avatarPath
  const { data, error } = await supabase.from('profiles').update(update).eq('id', userId).select().single()
  if (error) {
    if (avatarPath) await supabase.storage.from('family-images').remove([avatarPath])
    throw error
  }
  return data as Profile
}

export async function signedUrlsForPaths(paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))]
  const entries = await Promise.all(unique.map(async (path) => [path, await signedUrl(path)] as const))
  return new Map(entries)
}
