import type { FormEvent } from 'react'
import { useState } from 'react'
import type { Review } from '../lib/types'
import { createReview } from '../lib/api'
import { Button, Input, Modal, Textarea } from './UI'
import { StarPicker } from './Stars'
import { photoFileError } from '../lib/utils'

export default function ReviewFormModal({ userId, restaurantId, existing, onClose, onSaved }: { userId: string; restaurantId: string; existing?: Review; onClose: () => void; onSaved: () => Promise<void> }) {
  const [rating, setRating] = useState(existing?.rating ?? 5)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [visitDate, setVisitDate] = useState(existing?.visit_date ?? '')
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function choosePhotos(files: FileList | null) {
    const picked = Array.from(files ?? [])
    for (const file of picked) { const issue = photoFileError(file); if (issue) { setError(issue); return } }
    if (picked.length > 5) return setError('리뷰 사진은 한 번에 최대 5장까지 선택해주세요.')
    setPhotos(picked)
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (rating < 0.5 || rating > 5 || Math.abs(rating * 2 - Math.round(rating * 2)) > 1e-9) return setError('별점은 0.5점 단위로 0.5~5점까지 선택해주세요.')
    setSaving(true)
    try {
      await createReview({ restaurant_id: restaurantId, user_id: userId, rating, comment: comment.trim() || null, visit_date: visitDate || null }, photos)
      await onSaved(); onClose()
    } catch (err) { setError(err instanceof Error ? err.message : '리뷰를 저장하지 못했습니다.') } finally { setSaving(false) }
  }

  return <Modal title={existing ? '내 리뷰 수정' : '내 리뷰 작성'} onClose={onClose} footer={<div className="flex gap-2"><Button variant="ghost" className="flex-1" onClick={onClose}>취소</Button><Button className="flex-1" onClick={submit} disabled={saving}>{saving ? '저장 중…' : existing ? '수정하기' : '등록하기'}</Button></div>}>
    <form onSubmit={submit} className="space-y-5">
      <div><div className="text-sm font-semibold">별점</div><div className="mt-2"><StarPicker value={rating} onChange={setRating} /></div></div>
      <label className="block text-sm font-semibold">방문 날짜<Input className="mt-2" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} /></label>
      <label className="block text-sm font-semibold">코멘트<Textarea className="mt-2 min-h-32" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="음식, 분위기, 주차 등 유미슐랭 구성원에게 남기고 싶은 이야기를 적어주세요." /></label>
      <label className="block text-sm font-semibold">리뷰 사진 추가<span className="mt-1 block text-xs font-normal text-[#8b7d73]">JPG/PNG/WEBP · 사진당 최대 8MB · 최대 5장</span><input className="mt-2 w-full rounded-2xl border border-[#e6d9cf] bg-white px-4 py-3 text-sm" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => choosePhotos(e.target.files)} /></label>
      {existing && <p className="rounded-2xl bg-[#fff6ee] px-4 py-3 text-xs leading-5 text-[#76675d]">기존 리뷰를 수정할 때도 새 사진을 추가할 수 있습니다. 기존 사진은 그대로 유지됩니다.</p>}
      {error && <p className="rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm text-[#b53a32]">{error}</p>}
    </form>
  </Modal>
}
