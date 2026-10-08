import type { ReactNode } from 'react'
import type { RestaurantView } from '../lib/types'
import { Crown, Heart, Medal, Sparkles, TrendingUp } from 'lucide-react'

export default function StatsPanel({ restaurants, onSelect }: { restaurants: RestaurantView[]; onSelect: (id: string) => void }) {
  const rated = [...restaurants].filter((r) => r.familyAverage != null).sort((a, b) => (b.familyAverage! - a.familyAverage!))
  const visits = [...restaurants].sort((a, b) => b.visitCount - a.visitCount)
  const favorites = [...restaurants].sort((a, b) => b.favoriteCount - a.favoriteCount)
  const recent = [...restaurants].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const noReview = restaurants.length - rated.length

  const sections = [
    { title: '🏆 유미슐랭 평점 TOP 10', icon: <Crown size={17} />, items: rated.slice(0, 10), metric: (r: RestaurantView) => `⭐ ${r.familyAverage!.toFixed(1)}` },
    { title: '🍽️ 가장 많이 방문한 식당', icon: <TrendingUp size={17} />, items: visits.slice(0, 5), metric: (r: RestaurantView) => `${r.visitCount}회` },
    { title: '❤️ 유미슐랭 구성원들이 많이 즐겨찾은 식당', icon: <Heart size={17} />, items: favorites.slice(0, 5), metric: (r: RestaurantView) => `${r.favoriteCount}명` },
    { title: '🆕 최근 추가된 식당', icon: <Sparkles size={17} />, items: recent.slice(0, 5), metric: () => '최근' },
  ]
  return <div className="space-y-5">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="등록 식당" value={restaurants.length} icon={<Medal size={16} />} /><Stat label="리뷰 있는 식당" value={rated.length} icon={<Crown size={16} />} /><Stat label="즐겨찾기 최다" value={favorites[0]?.favoriteCount ?? 0} icon={<Heart size={16} />} /><Stat label="리뷰 없음" value={noReview} icon={<TrendingUp size={16} />} /></div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{sections.map((section) => <section key={section.title} className="rounded-[1.75rem] border border-[#eadfd4] bg-white p-5"><div className="flex items-center gap-2 font-black">{section.icon}{section.title}</div><div className="mt-4 space-y-2">{section.items.length ? section.items.map((restaurant, index) => <button key={restaurant.id} onClick={() => onSelect(restaurant.id)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-[#fff6ee]"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8eee8] text-sm font-black">{index + 1}</div><div className="min-w-0 flex-1"><div className="truncate font-bold">{restaurant.name}</div><div className="text-xs text-[#9a8b80]">{restaurant.category || '기타'}</div></div><span className="text-sm font-bold text-[#a94433]">{section.metric(restaurant)}</span></button>) : <p className="py-6 text-center text-sm text-[#9a8b80]">아직 데이터가 부족해요.</p>}</div></section>)}</div>
  </div>
}
function Stat({ label, value, icon }: { label: string; value: number; icon: ReactNode }) { return <div className="rounded-[1.5rem] border border-[#eadfd4] bg-white p-4"><div className="flex items-center justify-between text-xs font-semibold text-[#8b7d73]">{label}<span className="text-[#a94433]">{icon}</span></div><div className="mt-2 text-2xl font-black">{value}</div></div> }
