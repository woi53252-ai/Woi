import type { Profile } from '../lib/types'
import { Button } from './UI'
import { supabase } from '../lib/supabase'

export default function PendingApproval({ profile }: { profile: Profile }) {
  return (
    <div className="min-h-screen bg-[#fffaf5] px-5 py-12">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-[#eadfd4] bg-white p-7 text-center shadow-sm">
        <div className="text-5xl">🔐</div>
        <h1 className="mt-4 text-2xl font-black">유미슐랭 승인 대기 중</h1>
        <p className="mt-3 text-sm leading-6 text-[#7e7067]">{profile.display_name}님 계정은 만들어졌지만 아직 유미슐랭 구성원 승인이 완료되지 않았습니다.</p>
        <div className="mt-5 rounded-2xl bg-[#fff6ee] p-4 text-left text-sm text-[#6e5e54]">
          <div><b>이메일</b> {profile.email ?? '-'}</div>
          <p className="mt-3 text-xs leading-5">기존 유미슐랭 계정에서 Supabase SQL Editor로 해당 프로필의 <code>approved = true</code>를 설정하면 됩니다.</p>
        </div>
        <Button variant="ghost" className="mt-5 w-full" onClick={() => supabase.auth.signOut()}>로그아웃</Button>
      </div>
    </div>
  )
}
