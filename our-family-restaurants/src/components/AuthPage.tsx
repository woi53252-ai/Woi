import type { FormEvent } from 'react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { SITE_NAME, SITE_NAME_EN, SITE_LOGO_PATH } from '../lib/site'
import { Button, Input } from './UI'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true); setMessage(''); setError('')
    try {
      if (mode === 'signup') {
        if (!displayName.trim()) throw new Error('이름을 입력해주세요.')
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { display_name: displayName.trim() } },
        })
        if (signUpError) throw signUpError
        if (data.session) setMessage('가입되었습니다. 기존 유미슐랭 구성원이 승인하면 유미슐랭을 이용할 수 있어요.')
        else setMessage('가입되었습니다. 이메일 인증이 켜져 있다면 이메일 인증 후 로그인해주세요. 이후 유미슐랭 구성원 승인까지 필요합니다.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (signInError) throw signInError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff0e7,transparent_50%),#fffaf5] px-5 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-[#eadfd4] bg-white/90 p-6 shadow-[0_20px_70px_rgba(119,83,57,0.12)] backdrop-blur sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] bg-[#fffaf5] p-1.5 shadow-sm"><img src={SITE_LOGO_PATH} alt={`${SITE_NAME} 로고`} className="h-full w-full object-contain" /></div>
            <h1 className="text-3xl font-black tracking-tight text-[#3b302a]">{SITE_NAME}</h1>
            <p className="mt-1 text-xs font-semibold tracking-wide text-[#a94433]">{SITE_NAME_EN}</p>
            <p className="mt-2 text-sm text-[#8b7d73]">유미슐랭의 맛집 가이드</p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#f8eee8] p-1">
            {(['login', 'signup'] as const).map((item) => (
              <button key={item} type="button" onClick={() => { setMode(item); setError(''); setMessage('') }} className={`rounded-xl px-3 py-2 text-sm font-semibold ${mode === item ? 'bg-white text-[#3b302a] shadow-sm' : 'text-[#8b7d73]'}`}>
                {item === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && <label className="block text-sm font-semibold text-[#5e5148]">이름<Input className="mt-2" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="예: 홍길동" /></label>}
            <label className="block text-sm font-semibold text-[#5e5148]">이메일<Input className="mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="family@example.com" autoComplete="email" /></label>
            <label className="block text-sm font-semibold text-[#5e5148]">비밀번호<Input className="mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
            {error && <p className="rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm text-[#b53a32]">{error}</p>}
            {message && <p className="rounded-2xl bg-[#edf8f1] px-4 py-3 text-sm text-[#2d7146]">{message}</p>}
            <Button className="w-full" disabled={loading}>{loading ? '처리 중…' : mode === 'login' ? '로그인' : '유미슐랭 계정 만들기'}</Button>
          </form>

          {mode === 'signup' && <div className="mt-5 rounded-2xl bg-[#fff6ee] px-4 py-3 text-xs leading-5 text-[#76675d]">보안을 위해 신규 가입자는 바로 유미슐랭 데이터에 접근할 수 없고, 기존 유미슐랭 계정이 승인해야 합니다.</div>}
        </div>
      </div>
    </div>
  )
}
