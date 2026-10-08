import type { FormEvent } from 'react'
import { useState } from 'react'
import type { Profile } from '../lib/types'
import { updateMyProfile } from '../lib/api'
import { Button, Input, Modal } from './UI'
import { photoFileError } from '../lib/utils'

export default function ProfileModal({ profile, onClose, onSaved }: { profile: Profile; onClose: () => void; onSaved: (profile: Profile) => void }) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!displayName.trim()) return setError('이름을 입력해주세요.')
    if (avatarFile) { const issue = photoFileError(avatarFile); if (issue) return setError(issue) }
    setSaving(true)
    try { const next = await updateMyProfile(profile.id, displayName, avatarFile); onSaved(next); onClose() }
    catch (err) { setError(err instanceof Error ? err.message : '프로필을 저장하지 못했습니다.') }
    finally { setSaving(false) }
  }
  return <Modal title="내 프로필" onClose={onClose} footer={<div className="flex gap-2"><Button variant="ghost" className="flex-1" onClick={onClose}>취소</Button><Button className="flex-1" onClick={submit} disabled={saving}>{saving ? '저장 중…' : '저장하기'}</Button></div>}>
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl bg-[#fff6ee] p-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fce9e4] text-2xl">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" /> : "🙂"}</div><div><div className="font-bold">{profile.email}</div><div className="mt-1 text-xs text-[#8b7d73]">이메일은 Supabase Auth 계정에서 관리됩니다.</div></div></div>
      <label className="block text-sm font-semibold">이름<Input className="mt-2" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label>
      <label className="block text-sm font-semibold">프로필 사진(선택)<input className="mt-2 w-full rounded-2xl border border-[#e6d9cf] bg-white px-4 py-3 text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} /></label>
      {error && <p className="rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm text-[#b53a32]">{error}</p>}
    </form>
  </Modal>
}
