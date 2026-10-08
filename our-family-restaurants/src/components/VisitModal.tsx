import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { Profile } from '../lib/types'
import { createVisit } from '../lib/api'
import { Button, Input, Modal, Textarea } from './UI'

export default function VisitModal({ userId, restaurantId, profiles, onClose, onSaved }: { userId: string; restaurantId: string; profiles: Profile[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [attendees, setAttendees] = useState<string[]>([userId])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const sorted = useMemo(() => [...profiles].sort((a, b) => a.display_name.localeCompare(b.display_name, 'ko')), [profiles])

  function toggle(id: string) { setAttendees((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]) }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!attendees.length) return setError('방문한 가족을 한 명 이상 선택해주세요.')
    setSaving(true)
    try { await createVisit(restaurantId, userId, visitDate, attendees, note); await onSaved(); onClose() }
    catch (err) { setError(err instanceof Error ? err.message : '방문 기록을 저장하지 못했습니다.') }
    finally { setSaving(false) }
  }

  return <Modal title="방문 기록 추가" onClose={onClose} footer={<div className="flex gap-2"><Button variant="ghost" className="flex-1" onClick={onClose}>취소</Button><Button className="flex-1" onClick={submit} disabled={saving}>{saving ? '저장 중…' : '기록하기'}</Button></div>}>
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-semibold">방문 날짜<Input className="mt-2" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} /></label>
      <div><div className="mb-2 text-sm font-semibold">방문한 가족</div><div className="grid grid-cols-2 gap-2">{sorted.map((profile) => { const selected = attendees.includes(profile.id); return <button key={profile.id} type="button" onClick={() => toggle(profile.id)} className={`rounded-2xl border px-3 py-3 text-left text-sm ${selected ? 'border-[#d65a45] bg-[#fce9e4] text-[#a94433]' : 'border-[#eadfd4] bg-white text-[#6e5e54]'}`}><div className="font-bold">{selected ? '✓ ' : ''}{profile.display_name}</div></button> })}</div></div>
      <label className="block text-sm font-semibold">메모(선택)<Textarea className="mt-2 min-h-24" value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 부모님 결혼기념일 식사" /></label>
      {error && <p className="rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm text-[#b53a32]">{error}</p>}
    </form>
  </Modal>
}
