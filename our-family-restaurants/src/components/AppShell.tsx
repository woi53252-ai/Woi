import { useMemo, useState } from 'react'
import { BarChart3, LogOut, Plus, Search, UserRound, X } from 'lucide-react'
import type { RestaurantView, SortOption, Profile } from '../lib/types'
import { CATEGORIES } from '../lib/types'
import { SITE_NAME, SITE_NAME_EN, SITE_LOGO_PATH } from '../lib/site'
import { Button, Input } from './UI'
import RestaurantCard from './RestaurantCard'
import StatsPanel from './StatsPanel'
import RestaurantFormModal from './RestaurantFormModal'
import ProfileModal from './ProfileModal'

export default function AppShell({ userId, profile, profiles, restaurants, onRefresh, onFavorite, onSelectRestaurant, onSignOut, onProfileSaved }: { userId: string; profile: Profile; profiles: Profile[]; restaurants: RestaurantView[]; onRefresh: () => Promise<void>; onFavorite: (restaurant: RestaurantView) => Promise<void>; onSelectRestaurant: (id: string) => void; onSignOut: () => Promise<void>; onProfileSaved: (profile: Profile) => void }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('전체')
  const [minRating, setMinRating] = useState('0')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [visitedOnly, setVisitedOnly] = useState(false)
  const [sort, setSort] = useState<SortOption>('recent')
  const [showAdd, setShowAdd] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return [...restaurants].filter((restaurant) => {
      const hit = !query || restaurant.name.toLowerCase().includes(query) || (restaurant.address ?? '').toLowerCase().includes(query)
      const categoryHit = category === '전체' || restaurant.category === category
      const ratingHit = Number(minRating) === 0 || (restaurant.familyAverage ?? 0) >= Number(minRating)
      const favoriteHit = !favoriteOnly || restaurant.isFavorite
      const visitedHit = !visitedOnly || restaurant.visitCount > 0
      return hit && categoryHit && ratingHit && favoriteHit && visitedHit
    }).sort((a, b) => {
      if (sort === 'rating_desc') return (b.familyAverage ?? -1) - (a.familyAverage ?? -1)
      if (sort === 'rating_asc') return (a.familyAverage ?? 99) - (b.familyAverage ?? 99)
      if (sort === 'name') return a.name.localeCompare(b.name, 'ko')
      if (sort === 'visited') return (b.lastVisit ?? '').localeCompare(a.lastVisit ?? '')
      return b.created_at.localeCompare(a.created_at)
    })
  }, [restaurants, search, category, minRating, favoriteOnly, visitedOnly, sort])

  function resetFilters() { setSearch(''); setCategory('전체'); setMinRating('0'); setFavoriteOnly(false); setVisitedOnly(false); setSort('recent') }

  return <div className="min-h-screen bg-[#fffaf5]">
    <header className="sticky top-0 z-20 border-b border-[#eadfd4]/80 bg-[#fffaf5]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowStats(false)} className="min-w-0 flex-1 text-left"><div className="flex items-center gap-2.5"><img src={SITE_LOGO_PATH} alt="" className="h-11 w-11 shrink-0 rounded-2xl object-contain" /><div className="min-w-0"><div className="text-[11px] font-bold text-[#a94433]">{SITE_NAME_EN}</div><div className="truncate text-lg font-black tracking-tight text-[#3b302a] sm:text-xl">{SITE_NAME}</div></div></div></button>
          <Button variant="soft" className="px-3" onClick={() => setShowStats((current) => !current)}><BarChart3 size={17} /><span className="desktop-only">통계</span></Button>
          <Button className="px-3" onClick={() => setShowAdd(true)}><Plus size={17} /><span className="desktop-only">식당 추가</span></Button>
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 rounded-2xl border border-[#eadfd4] bg-white px-2.5 py-2 text-left hover:bg-[#fff5ef]"><div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#fce9e4]">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" /> : "🙂"}</div><div className="desktop-only leading-tight"><div className="text-xs font-bold">{profile.display_name}</div></div></button>
          <button onClick={onSignOut} className="rounded-2xl border border-[#eadfd4] bg-white p-2.5 text-[#7f7268] hover:bg-[#fff5ef]" aria-label="로그아웃"><LogOut size={17} /></button>
        </div>
        {!showStats && <div className="mt-3 flex gap-2"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8b80]" /><Input className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="식당 이름이나 주소 검색" /></div><Button variant="ghost" onClick={() => setFiltersOpen((current) => !current)}>{filtersOpen ? <X size={17} /> : '필터'}</Button></div>}
      </div>
      {!showStats && filtersOpen && <div className="border-t border-[#eadfd4] bg-white"><div className="mx-auto max-w-6xl px-4 py-4 sm:px-6"><div className="grid grid-cols-2 gap-2 sm:grid-cols-5"><select className="rounded-2xl border border-[#e6d9cf] bg-white px-3 py-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}><option>전체</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><select className="rounded-2xl border border-[#e6d9cf] bg-white px-3 py-3 text-sm" value={minRating} onChange={(e) => setMinRating(e.target.value)}><option value="0">별점 전체</option><option value="4">⭐ 4.0 이상</option><option value="4.5">⭐ 4.5 이상</option><option value="5">⭐ 5.0</option></select><button onClick={() => setFavoriteOnly((value) => !value)} className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${favoriteOnly ? 'border-[#d65a45] bg-[#fce9e4] text-[#a94433]' : 'border-[#e6d9cf] bg-white'}`}>❤️ 즐겨찾기</button><button onClick={() => setVisitedOnly((value) => !value)} className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${visitedOnly ? 'border-[#d65a45] bg-[#fce9e4] text-[#a94433]' : 'border-[#e6d9cf] bg-white'}`}>🍽️ 방문함</button><select className="col-span-2 rounded-2xl border border-[#e6d9cf] bg-white px-3 py-3 text-sm sm:col-span-1" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}><option value="recent">최근 추가</option><option value="rating_desc">별점 높은 순</option><option value="rating_asc">별점 낮은 순</option><option value="name">이름순</option><option value="visited">최근 방문순</option></select></div><div className="mt-3 flex items-center justify-between text-xs text-[#9a8b80]"><span>{filtered.length}개 표시 중</span><button onClick={resetFilters} className="font-semibold underline">필터 초기화</button></div></div></div>}
    </header>

    <main className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6">
      {showStats ? <><div className="mb-5 flex items-center justify-between"><div><h1 className="text-2xl font-black">유미슐랭 통계</h1><p className="mt-1 text-sm text-[#8b7d73]">가족의 맛집 기록을 한눈에 봅니다.</p></div><Button variant="ghost" onClick={() => setShowStats(false)}>목록 보기</Button></div><StatsPanel restaurants={restaurants} onSelect={onSelectRestaurant} /></> : <>
        <div className="mb-5 flex items-end justify-between gap-3"><div><h1 className="text-2xl font-black">{SITE_NAME}</h1><p className="mt-1 text-sm text-[#8b7d73]">유미슐랭이 저장하고 평가한 맛집들</p></div><span className="rounded-full bg-[#f8eee8] px-3 py-1.5 text-xs font-bold text-[#6e5e54]">총 {filtered.length}곳</span></div>
        {filtered.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={() => onSelectRestaurant(restaurant.id)} />)}</div> : <div className="rounded-[2rem] border border-dashed border-[#e1d3c8] bg-white px-6 py-16 text-center"><div className="text-5xl">🍜</div><h2 className="mt-4 text-xl font-black">조건에 맞는 식당이 없어요</h2><p className="mt-2 text-sm text-[#8b7d73]">검색어나 필터를 바꾸거나 첫 맛집을 등록해보세요.</p><Button className="mt-5" onClick={() => setShowAdd(true)}><Plus size={17} />첫 식당 추가</Button></div>}
      </>}
    </main>

    {showAdd && <RestaurantFormModal userId={userId} onClose={() => setShowAdd(false)} onSaved={onRefresh} />}
    {showProfile && <ProfileModal profile={profile} onClose={() => setShowProfile(false)} onSaved={onProfileSaved} />}
  </div>
}
