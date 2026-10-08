import { useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink, Heart, MapPin, Phone, Plus, Star, Utensils, Globe, Pencil, Trash2 } from 'lucide-react'
import type { Profile, RestaurantView, Review, Visit } from '../lib/types'
import { formatDate, formatDateTime } from '../lib/utils'
import { Button } from './UI'
import { StaticStars } from './Stars'
import ReviewFormModal from './ReviewFormModal'
import VisitModal from './VisitModal'
import RestaurantFormModal from './RestaurantFormModal'

export default function RestaurantDetail({ restaurant, userId, profiles, visits, onBack, onFavorite, onRefresh, onDeleteReview, onDeleteRestaurant }: { restaurant: RestaurantView; userId: string; profiles: Profile[]; visits: Visit[]; onBack: () => void; onFavorite: () => Promise<void>; onRefresh: () => Promise<void>; onDeleteReview: (review: Review) => Promise<void>; onDeleteRestaurant: (restaurantId: string) => Promise<void> }) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deletingRestaurant, setDeletingRestaurant] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const mine = restaurant.reviews.find((review) => review.user_id === userId)
  const myVisits = visits.filter((visit) => visit.restaurant_id === restaurant.id).sort((a, b) => b.visit_date.localeCompare(a.visit_date))
  const attendeesById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles])
  const canManageRestaurant = restaurant.created_by === userId

  async function handleDeleteRestaurant() {
    if (!canManageRestaurant || deletingRestaurant) return
    const confirmed = window.confirm(`'${restaurant.name}'을 삭제할까요?\n\n식당 정보와 연결된 리뷰, 즐겨찾기, 방문 기록도 함께 삭제됩니다. 삭제하면 되돌릴 수 없습니다.`)
    if (!confirmed) return
    setDeleteError('')
    setDeletingRestaurant(true)
    try {
      await onDeleteRestaurant(restaurant.id)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : '식당을 삭제하지 못했습니다.')
    } finally {
      setDeletingRestaurant(false)
    }
  }

  return <div className="min-h-screen bg-[#fffaf5]">
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <button onClick={onBack} className="mt-5 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-[#6e5e54] hover:bg-[#f8eee8]"><ArrowLeft size={18} />목록으로</button>
      <div className="mt-3 overflow-hidden rounded-[2rem] border border-[#eadfd4] bg-white shadow-sm">
        <div className="relative aspect-[16/8] bg-[#f7eee7]">
          {restaurant.images.find((image) => image.is_cover)?.signedUrl || restaurant.images[0]?.signedUrl ? <img src={(restaurant.images.find((image) => image.is_cover) ?? restaurant.images[0]).signedUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl">🍽️</div>}
          <button onClick={onFavorite} className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-[#b44c3b] shadow-sm backdrop-blur" aria-label="즐겨찾기">{restaurant.isFavorite ? <Heart fill="currentColor" /> : <Heart />}</button>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#fce9e4] px-3 py-1 text-xs font-bold text-[#a94433]">{restaurant.category || '기타'}</span><span className="text-xs text-[#9a8b80]">등록 {formatDateTime(restaurant.created_at)}</span></div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#3b302a]">{restaurant.name}</h1>
              {restaurant.address && <p className="mt-2 flex gap-2 text-sm text-[#73665e]"><MapPin size={17} className="mt-0.5 shrink-0" />{restaurant.address}</p>}
              {canManageRestaurant && <div className="mt-4 flex flex-wrap gap-2"><Button variant="ghost" className="px-3" onClick={() => setEditOpen(true)}><Pencil size={16} />식당 수정</Button><Button variant="danger" className="px-3" onClick={handleDeleteRestaurant} disabled={deletingRestaurant}><Trash2 size={16} />{deletingRestaurant ? '삭제 중…' : '식당 삭제'}</Button></div>}
            </div>
            <div className="shrink-0 rounded-2xl bg-[#fff6ee] p-4 text-center"><div className="flex items-center justify-center gap-1 text-2xl font-black"><Star size={21} fill="#f2aa38" className="text-[#f2aa38]" />{restaurant.familyAverage != null ? restaurant.familyAverage.toFixed(1) : '-'}</div><div className="mt-1 text-xs text-[#8b7d73]">유미슐랭 리뷰 {restaurant.reviews.length}개</div></div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {restaurant.phone && <a href={`tel:${restaurant.phone}`} className="rounded-2xl bg-[#fffaf5] px-4 py-3 text-sm font-semibold hover:bg-[#f8eee8]"><Phone size={16} className="mr-2 inline" />{restaurant.phone}</a>}
            {(restaurant.naver_map_url || restaurant.kakao_map_url) && <div className="flex gap-2 rounded-2xl bg-[#fffaf5] px-3 py-2"><MapPin size={16} className="mt-1 shrink-0" />{restaurant.naver_map_url && <a className="text-sm font-semibold underline" href={restaurant.naver_map_url} target="_blank" rel="noreferrer">네이버지도 <ExternalLink size={12} className="inline" /></a>}{restaurant.kakao_map_url && <a className="text-sm font-semibold underline" href={restaurant.kakao_map_url} target="_blank" rel="noreferrer">카카오맵 <ExternalLink size={12} className="inline" /></a>}</div>}
            {restaurant.website_url && <a href={restaurant.website_url} target="_blank" rel="noreferrer" className="rounded-2xl bg-[#fffaf5] px-4 py-3 text-sm font-semibold"><Globe size={16} className="mr-2 inline" />웹사이트 <ExternalLink size={12} className="inline" /></a>}
          </div>
          {restaurant.memo && <div className="mt-5 rounded-2xl bg-[#fff6ee] p-4 text-sm leading-6 text-[#6d5e54]"><b>유미슐랭 메모</b><div className="mt-1 whitespace-pre-wrap">{restaurant.memo}</div></div>}
          {deleteError && <div className="mt-4 rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm text-[#b53a32]">{deleteError}</div>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button className="flex-1" onClick={() => setReviewOpen(true)}>{mine ? <><Pencil size={17} />내 리뷰 수정</> : <><Plus size={17} />내 리뷰 남기기</>}</Button><Button variant="soft" className="flex-1" onClick={() => setVisitOpen(true)}><Utensils size={17} />방문 기록 추가</Button></div>
        </div>
      </div>

      <section className="mt-6 rounded-[2rem] border border-[#eadfd4] bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">유미슐랭 리뷰</h2><p className="mt-1 text-sm text-[#8b7d73]">각 유미슐랭 구성원은 한 식당에 리뷰 하나만 남길 수 있어요.</p></div><div className="flex items-center gap-2"><StaticStars value={restaurant.familyAverage} /><span className="font-bold">{restaurant.familyAverage?.toFixed(1) ?? '-'}</span></div></div>
        <div className="mt-5 space-y-4">
          {restaurant.reviews.length ? restaurant.reviews.map((review) => <ReviewCard key={review.id} review={review} isMine={review.user_id === userId} onEdit={() => setReviewOpen(true)} onDelete={() => onDeleteReview(review)} />) : <div className="rounded-2xl border border-dashed border-[#eadfd4] px-5 py-9 text-center text-sm text-[#9a8b80]">아직 리뷰가 없어요. 첫 리뷰를 남겨보세요.</div>}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-[#eadfd4] bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">방문 기록</h2><p className="mt-1 text-sm text-[#8b7d73]">유미슐랭이 방문했던 날짜를 간단히 남겨둘 수 있어요.</p></div><span className="rounded-full bg-[#f8eee8] px-3 py-1 text-xs font-bold text-[#6e5e54]">{myVisits.length}회</span></div>
        <div className="mt-4 space-y-3">{myVisits.length ? myVisits.map((visit) => <div key={visit.id} className="rounded-2xl bg-[#fffaf5] p-4"><div className="font-bold">{formatDate(visit.visit_date)}</div><div className="mt-2 flex flex-wrap gap-2">{visit.attendee_ids.map((id) => { const p = attendeesById.get(id); return p ? <span key={id} className="rounded-full border border-[#eadfd4] bg-white px-2.5 py-1 text-xs font-semibold">{p.display_name}</span> : null })}</div>{visit.note && <div className="mt-2 text-sm text-[#7a6d64]">{visit.note}</div>}</div>) : <div className="py-8 text-center text-sm text-[#9a8b80]">등록된 방문 기록이 없어요.</div>}</div>
      </section>

      {editOpen && <RestaurantFormModal userId={userId} restaurant={restaurant} onClose={() => setEditOpen(false)} onSaved={onRefresh} />}
      {reviewOpen && <ReviewFormModal userId={userId} restaurantId={restaurant.id} existing={mine} onClose={() => setReviewOpen(false)} onSaved={onRefresh} />}
      {visitOpen && <VisitModal userId={userId} restaurantId={restaurant.id} profiles={profiles} onClose={() => setVisitOpen(false)} onSaved={onRefresh} />}
    </div>
  </div>
}

function ReviewCard({ review, isMine, onEdit, onDelete }: { review: Review; isMine: boolean; onEdit: () => void; onDelete: () => Promise<void> }) {
  const [deleting, setDeleting] = useState(false)
  const name = review.profile?.display_name ?? '가족'
  async function deleteReview() {
    if (!window.confirm('내 리뷰를 삭제할까요?')) return
    setDeleting(true); try { await onDelete() } finally { setDeleting(false) }
  }
  return <article className="rounded-[1.5rem] border border-[#eadfd4] p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div><div className="flex items-center gap-2"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#fce9e4] text-lg">{review.profile?.avatarUrl ? <img src={review.profile.avatarUrl} alt="" className="h-full w-full object-cover" /> : '🙂'}</div><div><div className="font-bold">{name}</div><div className="mt-1"><StaticStars value={review.rating} size="text-sm" /></div></div></div></div>
      {isMine && <div className="flex gap-1"><button className="rounded-xl p-2 text-[#8b7d73] hover:bg-[#f8eee8]" aria-label="수정" onClick={onEdit}><Pencil size={16} /></button><button disabled={deleting} className="rounded-xl p-2 text-[#b7493d] hover:bg-[#fff0ef]" aria-label="삭제" onClick={deleteReview}><Trash2 size={16} /></button></div>}
    </div>
    {review.comment && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#62554d]">{review.comment}</p>}
    <div className="mt-3 text-xs text-[#9a8b80]">{review.visit_date ? `방문 ${formatDate(review.visit_date)} · ` : ''}작성 {formatDateTime(review.updated_at)}</div>
    {review.images?.length ? <div className="mt-4 grid grid-cols-3 gap-2">{review.images.map((image) => image.signedUrl ? <img key={image.id} src={image.signedUrl} alt="리뷰 사진" className="aspect-square w-full rounded-xl object-cover" /> : null)}</div> : null}
  </article>
}
