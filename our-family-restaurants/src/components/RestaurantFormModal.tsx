import type { FormEvent } from 'react'
import { useState } from 'react'
import { CATEGORIES } from '../lib/types'
import { createRestaurant, updateRestaurant } from '../lib/api'
import type { Category, RestaurantView } from '../lib/types'
import { Button, Input, Modal, Textarea } from './UI'
import { isValidUrl, photoFileError } from '../lib/utils'

export default function RestaurantFormModal({ userId, restaurant, onClose, onSaved }: { userId: string; restaurant?: RestaurantView | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const editing = Boolean(restaurant)
  const [name, setName] = useState(restaurant?.name ?? '')
  const [address, setAddress] = useState(restaurant?.address ?? '')
  const [phone, setPhone] = useState(restaurant?.phone ?? '')
  const [category, setCategory] = useState<Category>((restaurant?.category as Category) ?? '한식')
  const [memo, setMemo] = useState(restaurant?.memo ?? '')
  const [naver, setNaver] = useState(restaurant?.naver_map_url ?? '')
  const [kakao, setKakao] = useState(restaurant?.kakao_map_url ?? '')
  const [website, setWebsite] = useState(restaurant?.website_url ?? '')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!name.trim()) return setError('식당 이름을 입력해주세요.')
    for (const [label, value] of [['네이버지도', naver], ['카카오맵', kakao], ['웹사이트', website]] as const) if (value && !isValidUrl(value)) return setError(`${label} 링크는 http:// 또는 https:// 주소여야 합니다.`)
    if (coverFile) { const photoError = photoFileError(coverFile); if (photoError) return setError(photoError) }
    setSaving(true)
    try {
      const fields = { name: name.trim(), address: address.trim() || null, phone: phone.trim() || null, category, memo: memo.trim() || null, naver_map_url: naver.trim() || null, kakao_map_url: kakao.trim() || null, website_url: website.trim() || null }
      if (editing && restaurant) {
        await updateRestaurant(restaurant.id, userId, fields, coverFile)
      } else {
        await createRestaurant({ ...fields, created_by: userId }, coverFile)
      }
      await onSaved(); onClose()
    } catch (err) { setError(err instanceof Error ? err.message : `식당을 ${editing ? '수정' : '저장'}하지 못했습니다.`) } finally { setSaving(false) }
  }

  const coverUrl = restaurant?.images.find((image) => image.is_cover)?.signedUrl ?? restaurant?.images[0]?.signedUrl

  return <Modal title={editing ? '식당 정보 수정' : '식당 추가'} onClose={onClose} footer={<div className="flex gap-2"><Button variant="ghost" className="flex-1" onClick={onClose}>취소</Button><Button className="flex-1" onClick={submit} disabled={saving}>{saving ? '저장 중…' : editing ? '수정하기' : '저장하기'}</Button></div>}>
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-semibold">식당 이름 *<Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 시골밥상" /></label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">카테고리<select className="mt-2 w-full rounded-2xl border border-[#e6d9cf] bg-white px-4 py-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value as Category)}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block text-sm font-semibold">전화번호<Input className="mt-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="031-123-4567" /></label>
      </div>
      <label className="block text-sm font-semibold">주소<Input className="mt-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="경기 수원시 …" /></label>
      <label className="block text-sm font-semibold">대표 사진<span className="mt-1 block text-xs font-normal text-[#8b7d73]">JPG/PNG/WEBP · 최대 8MB</span>{editing && coverUrl && <img src={coverUrl} alt="현재 대표 사진" className="mt-2 aspect-[16/7] w-full rounded-2xl object-cover" />}<input className="mt-2 w-full rounded-2xl border border-[#e6d9cf] bg-white px-4 py-3 text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} /></label>
      {editing && <p className="rounded-2xl bg-[#fff6ee] px-4 py-3 text-xs leading-5 text-[#76675d]">새 대표 사진을 선택하면 새 사진이 대표 사진이 됩니다. 기존 사진은 보존됩니다.</p>}
      <label className="block text-sm font-semibold">메모<Textarea className="mt-2 min-h-24" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="유미슐랭 구성원에게 남길 메모" /></label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">네이버지도 링크<Input className="mt-2" value={naver} onChange={(e) => setNaver(e.target.value)} placeholder="https://map.naver.com/…" /></label>
        <label className="block text-sm font-semibold">카카오맵 링크<Input className="mt-2" value={kakao} onChange={(e) => setKakao(e.target.value)} placeholder="https://place.map.kakao.com/…" /></label>
      </div>
      <label className="block text-sm font-semibold">웹사이트 링크<Input className="mt-2" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" /></label>
      {error && <p className="rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm text-[#b53a32]">{error}</p>}
      <button type="submit" className="hidden" />
    </form>
  </Modal>
}
