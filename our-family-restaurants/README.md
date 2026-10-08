# 유미슐랭 (Yumichelin)

가족끼리만 사용하는 맛집 공유 웹앱입니다.
React + TypeScript + Tailwind CSS + Supabase + Vercel 조합으로 구성되어 있습니다.

## 포함 기능

- 이메일/비밀번호 회원가입 및 로그인
- 가족 구성원 승인 방식
- 식당 등록/수정/삭제 및 대표 사진
- 식당 목록 / 검색 / 카테고리 / 별점 / 즐겨찾기 / 방문 여부 필터
- 가족별 별점 및 코멘트
- 별점 0.5점 단위 (0.5~5.0)
- 리뷰 1인 1개, 수정/삭제
- 리뷰 사진 여러 장
- 방문 날짜 + 방문 가족 선택
- 가족 통계
- Supabase PostgreSQL + RLS
- Supabase Storage private bucket
- 모바일 우선 반응형 UI
- 가족 역할(엄마/아빠/나/동생) 기능 제거

## 1. 설치

Node.js 20 LTS 이상을 권장합니다.

```bash
npm install
```

## 2. Supabase 만들기

1. Supabase Dashboard에서 새 프로젝트를 만듭니다.
2. Authentication > Providers > Email에서 Email/Password를 활성화합니다.
3. SQL Editor에서 `supabase/schema.sql`을 전체 실행합니다.
4. 기존 버전에서 업데이트하는 경우 `supabase/migrate-role-and-half-rating.sql`과 `supabase/migrate-restaurant-edit-delete.sql`을 실행합니다.
5. 처음 가입한 계정은 `approved = false`입니다. `supabase/approve-family-member.sql`로 실제 가족 계정을 승인하세요.

## 3. 환경변수

`.env.example`을 `.env.local`로 복사하고 Supabase Connect 화면의 Project URL / Publishable key를 넣습니다.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

서비스 역할 키(service_role)는 절대 넣지 마세요.

## 4. 로컬 실행

```bash
npm run dev
```

터미널에 표시된 로컬 주소로 접속합니다.

## 5. 첫 실행 테스트

1. 회원가입: 이름 + 이메일 + 비밀번호
2. Supabase에서 프로필 `approved = true` 설정
3. 로그인
4. 식당 추가
5. 다른 가족 계정도 가입/승인
6. 다른 기기에서 로그인 후 같은 식당이 보이는지 확인
7. 0.5 / 1.0 / 1.5 / ... / 5.0 별점을 테스트
8. 리뷰/즐겨찾기/방문 기록을 테스트
9. 식당 상세 화면에서 등록자 본인에게만 식당 수정/삭제 버튼이 보이는지 확인
10. 사진이 Storage의 `family-images` 버킷에 저장되는지 확인

## 6. Vercel 배포

GitHub에 이 폴더를 push한 뒤 Vercel에서 New Project > GitHub 저장소 선택.

Build Command: `npm run build`
Output Directory: `dist`

Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 7. Supabase Auth URL 설정

배포가 끝나면 Supabase Authentication > URL Configuration에서 Site URL과 Redirect URL을 실제 Vercel 주소로 맞춰주세요. 이메일 인증을 켠 경우 특히 중요합니다.

## 8. 자주 생기는 문제

### `Supabase 환경변수가 없습니다`
`.env.local` 이름과 변수 이름을 확인하고 개발 서버를 재시작하세요.

### 로그인은 되는데 식당이 안 보임
프로필의 `approved`가 true인지 확인하세요.

### 별점 저장 실패
`supabase/migrate-role-and-half-rating.sql` 또는 최신 `schema.sql`이 실행되었는지 확인하세요. `rating`은 0.5~5.0 사이의 0.5 단위만 허용합니다.

### 사진 업로드 실패
Storage에 `family-images` 버킷이 만들어졌는지, Storage 정책이 실행됐는지 확인하세요.

### RLS 42501 오류
정책 또는 grant가 빠진 경우가 많습니다. `schema.sql`을 다시 실행한 뒤 브라우저를 새로고침하세요.

## 구조

```text
src/
  components/
    AppShell.tsx
    AuthPage.tsx
    PendingApproval.tsx
    ProfileModal.tsx
    RestaurantCard.tsx
    RestaurantDetail.tsx
    RestaurantFormModal.tsx
    ReviewFormModal.tsx
    Stars.tsx
    StatsPanel.tsx
    UI.tsx
    VisitModal.tsx
  lib/
    api.ts
    site.ts
    supabase.ts
    types.ts
    utils.ts
  App.tsx
  main.tsx
supabase/
  schema.sql
  migrate-role-and-half-rating.sql
  migrate-restaurant-edit-delete.sql
  approve-family-member.sql
```

## 보안 메모

브라우저에는 Supabase Project URL과 publishable key만 들어갑니다. 실제 데이터 보호는 PostgreSQL RLS와 private Storage 정책으로 처리합니다.
`service_role` 키는 이 프로젝트의 어떤 프론트엔드 코드에도 넣지 않습니다.
