# 이후 확장하기 좋은 기능

현재 코드에는 다음 항목의 데이터 구조/기본 기능이 이미 들어 있습니다.

- 식당별 사진 데이터 구조
- 리뷰 사진 여러 장
- 방문 + 방문자 관계
- 개인별 즐겨찾기
- 가족 통계
- 가족 구성원 프로필(이름/사진/이메일)

다음 단계에서 추가하기 쉬운 기능:

1. 지도에서 가족 맛집 보기: restaurants에 latitude/longitude 추가 + 지도 SDK 연결.
2. 네이버지도/카카오맵 연동: 현재 naver_map_url / kakao_map_url 필드가 이미 존재.
3. 가족별 통계: profiles + reviews + visits를 기준으로 가족별 집계.
4. 방문 알림: Supabase Edge Functions + Vercel Cron 또는 외부 알림 서비스.
5. 다시 가고 싶은 곳: favorites와 별도 `want_to_revisit` boolean/table 추가.
6. 식당별 사진 앨범: restaurant_images 테이블을 이용한 갤러리 화면 추가.
7. 가족에게 추천: restaurant_recommendations 테이블 + 알림 상태 추가.
8. 공유 링크: 비로그인 사용자가 접근할 수 있는 공개/일회성 token은 별도 설계 필요.
9. 관리자: profiles에 app_role/admin flag를 별도로 추가하고 RLS 정책을 관리자 전용으로 확장.
