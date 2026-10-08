import { useCallback, useEffect, useMemo, useState } from 'react'
import AuthPage from './components/AuthPage'
import PendingApproval from './components/PendingApproval'
import AppShell from './components/AppShell'
import RestaurantDetail from './components/RestaurantDetail'
import { supabase } from './lib/supabase'
import type { Favorite, Profile, Restaurant, RestaurantImage, Review, ReviewImage, Visit, RestaurantView } from './lib/types'
import { average } from './lib/utils'
import { deleteRestaurant, deleteReview, getFamilyProfiles, getFavorites, getMyProfile, getRestaurantImages, getRestaurants, getReviewImages, getReviews, getVisits, signedUrlsForPaths, toggleFavorite } from './lib/api'

export default function App() {
  const [session, setSession] = useState<{ userId: string } | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [restaurantImages, setRestaurantImages] = useState<RestaurantImage[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewImages, setReviewImages] = useState<ReviewImage[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data }) => { if (alive) { setSession(data.session ? { userId: data.session.user.id } : null); setLoadingAuth(false) } })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession ? { userId: nextSession.user.id } : null))
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])

  const loadData = useCallback(async () => {
    if (!session?.userId) return
    setLoadingData(true); setError('')
    try {
      const [myProfile, familyProfiles, restaurantRows, imageRows, reviewRows, reviewImageRows, favoriteRows, visitRows] = await Promise.all([
        getMyProfile(session.userId), getFamilyProfiles(), getRestaurants(), getRestaurantImages(), getReviews(), getReviewImages(), getFavorites(), getVisits(),
      ])
      const allImagePaths = [...imageRows, ...reviewImageRows, ...familyProfiles.filter((item) => item.avatar_path).map((item) => ({ path: item.avatar_path! }))].map((item) => item.path)
      const urlMap = allImagePaths.length ? await signedUrlsForPaths(allImagePaths) : new Map<string, string>()
      const profilesWithUrls = familyProfiles.map((item) => ({ ...item, avatarUrl: item.avatar_path ? urlMap.get(item.avatar_path) : undefined }))
      const myProfileWithUrl = { ...myProfile, avatarUrl: myProfile.avatar_path ? urlMap.get(myProfile.avatar_path) : undefined }
      const profilesById = new Map(profilesWithUrls.map((item) => [item.id, item]))
      const reviewImagesByReview = new Map<string, ReviewImage[]>()
      for (const image of reviewImageRows) {
        const next = reviewImagesByReview.get(image.review_id) ?? []
        next.push({ ...image, signedUrl: urlMap.get(image.path) }); reviewImagesByReview.set(image.review_id, next)
      }
      const normalizedReviews = reviewRows.map((review) => ({ ...review, profile: profilesById.get(review.user_id), images: reviewImagesByReview.get(review.id) ?? [] }))
      setProfile(myProfileWithUrl); setProfiles(profilesWithUrls); setRestaurants(restaurantRows); setRestaurantImages(imageRows.map((image) => ({ ...image, signedUrl: urlMap.get(image.path) }))); setReviews(normalizedReviews); setReviewImages(reviewImageRows); setFavorites(favoriteRows); setVisits(visitRows)
    } catch (err) {
      console.error(err); setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.')
    } finally { setLoadingData(false) }
  }, [session?.userId])

  useEffect(() => { if (session?.userId) void loadData() }, [session?.userId, loadData])

  const restaurantViews = useMemo<RestaurantView[]>(() => {
    const favoriteSet = new Set(favorites.map((item) => item.restaurant_id))
    return restaurants.map((restaurant) => {
      const restaurantReviews = reviews.filter((review) => review.restaurant_id === restaurant.id)
      const restaurantVisits = visits.filter((visit) => visit.restaurant_id === restaurant.id)
      return {
        ...restaurant,
        images: restaurantImages.filter((image) => image.restaurant_id === restaurant.id),
        reviews: restaurantReviews,
        favoriteCount: favorites.filter((favorite) => favorite.restaurant_id === restaurant.id).length,
        familyAverage: average(restaurantReviews.map((review) => review.rating)),
        lastVisit: restaurantVisits.map((visit) => visit.visit_date).sort().at(-1) ?? null,
        visitCount: restaurantVisits.length,
        isFavorite: favoriteSet.has(restaurant.id),
      }
    })
  }, [restaurants, restaurantImages, reviews, favorites, visits])

  const selectedRestaurant = useMemo(() => restaurantViews.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null, [restaurantViews, selectedRestaurantId])

  async function signOut() { await supabase.auth.signOut(); setSelectedRestaurantId(null); setProfile(null) }
  async function handleFavorite(restaurant: RestaurantView) { if (!session) return; await toggleFavorite(session.userId, restaurant.id, restaurant.isFavorite); await loadData() }
  async function handleDeleteReview(review: Review) { await deleteReview(review); await loadData() }
  async function handleDeleteRestaurant(restaurantId: string) { await deleteRestaurant(restaurantId, session!.userId); setSelectedRestaurantId(null); await loadData() }

  if (loadingAuth) return <div className="flex min-h-screen items-center justify-center bg-[#fffaf5] text-sm text-[#8b7d73]">불러오는 중…</div>
  if (!session) return <AuthPage />
  if (!profile) return <div className="flex min-h-screen items-center justify-center">데이터를 준비하는 중…</div>
  if (!profile.approved) return <PendingApproval profile={profile} />

  return <>
    {loadingData && <div className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-full bg-[#3b302a] px-4 py-2 text-xs font-semibold text-white shadow-lg">유미슐랭 데이터를 동기화하는 중…</div>}
    {error && <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,540px)] -translate-x-1/2 rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm text-[#b53a32] shadow-lg">{error}<button className="ml-3 font-bold underline" onClick={() => setError('')}>닫기</button></div>}
    {selectedRestaurant ? <RestaurantDetail restaurant={selectedRestaurant} userId={session.userId} profiles={profiles} visits={visits} onBack={() => setSelectedRestaurantId(null)} onFavorite={() => handleFavorite(selectedRestaurant)} onRefresh={loadData} onDeleteReview={handleDeleteReview} onDeleteRestaurant={handleDeleteRestaurant} /> : <AppShell userId={session.userId} profile={profile} profiles={profiles} restaurants={restaurantViews} onRefresh={loadData} onFavorite={handleFavorite} onSelectRestaurant={setSelectedRestaurantId} onSignOut={signOut} onProfileSaved={setProfile} />}
  </>
}
