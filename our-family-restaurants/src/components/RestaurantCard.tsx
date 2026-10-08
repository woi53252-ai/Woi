import type { RestaurantView } from '../lib/types'
import { formatDate } from '../lib/utils'
import { StaticStars } from './Stars'

export default function RestaurantCard({ restaurant, onClick }: { restaurant: RestaurantView; onClick: () => void }) {
  const cover = restaurant.images.find((image) => image.is_cover) ?? restaurant.images[0]
  return (
    <button onClick={onClick} className="group w-full overflow-hidden rounded-[1.5rem] border border-[#eadfd4] bg-white text-left shadow-[0_8px_30px_rgba(119,83,57,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(119,83,57,0.11)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f7eee7]">
        {cover?.signedUrl ? <img src={cover.signedUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-5xl">🍽️</div>}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#5e5148] backdrop-blur">{restaurant.category || '기타'}</div>
        {restaurant.isFavorite && <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm backdrop-blur">❤️</div>}
      </div>
      <div className="p-4">
        <h3 className="truncate text-lg font-bold text-[#3b302a]">{restaurant.name}</h3>
        <p className="mt-1 truncate text-sm text-[#8b7d73]">{restaurant.address || '주소 미등록'}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {restaurant.familyAverage != null ? <><StaticStars value={restaurant.familyAverage} size="text-sm" /><b className="text-sm">{restaurant.familyAverage.toFixed(1)}</b></> : <span className="text-sm text-[#9a8b80]">아직 유미슐랭 리뷰 없음</span>}
          </div>
          <span className="text-xs text-[#8b7d73]">리뷰 {restaurant.reviews.length}개</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[#9a8b80]">
          <span>최근 방문 {formatDate(restaurant.lastVisit)}</span>
          <span>방문 {restaurant.visitCount}회</span>
        </div>
      </div>
    </button>
  )
}
