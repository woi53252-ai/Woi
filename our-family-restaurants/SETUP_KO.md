# 유미슐랭 (Yumichelin) — 초보자용 실행 순서

아래 순서대로 하면 됩니다. 특별히 코드를 수정할 필요는 없습니다.

## 0. 먼저 준비할 것

- Node.js 20 이상
- GitHub 계정
- Supabase 계정
- Vercel 계정

## 1. 프로젝트 다운로드 후 터미널 열기

프로젝트 폴더에서 터미널을 열고 다음을 실행합니다.

```bash
npm install
```

## 2. Supabase 프로젝트 만들기

Supabase Dashboard → New project → 프로젝트 생성.

생성 후:

- Authentication → Providers → Email → Email/Password 활성화
- SQL Editor → `supabase/schema.sql` 전체 복사 → Run

이 단계에서 PostgreSQL 테이블, RLS, private Storage bucket이 모두 준비됩니다.
기존 버전의 사이트를 업데이트하는 경우 `supabase/migrate-role-and-half-rating.sql`과 `supabase/migrate-restaurant-edit-delete.sql`을 실행하세요. 가족 역할 컬럼이 제거되고 별점이 0.5점 단위로 바뀌며, 식당 등록자가 식당을 수정/삭제할 수 있는 RLS 정책도 적용됩니다.

## 3. `.env.local` 만들기

이번 ZIP에는 요청하신 Supabase 프로젝트의 `.env.local`이 이미 포함되어 있습니다. 다른 Supabase 프로젝트를 쓰게 되면 이 파일의 두 값을 바꾸면 됩니다.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

브라우저용 publishable key만 사용합니다. `service_role` 또는 secret key는 넣지 마세요.

주의: `service_role` 또는 secret key는 절대로 넣으면 안 됩니다.

## 4. 로컬 실행

```bash
npm run dev
```

표시된 주소(보통 `http://localhost:5173`)를 휴대폰/PC 브라우저에서 엽니다.

## 5. 최초 가족 계정 만들기

1. 회원가입 화면에서 본인 이름을 입력합니다.
2. 로그인합니다.
3. 아직 `가족 승인 대기 중`이 보이면 정상입니다.
4. Supabase → SQL Editor에서 아래를 실행합니다.

```sql
select id, email, display_name, approved
from public.profiles
order by created_at desc;
```

5. 본인의 UUID를 확인하고:

```sql
update public.profiles
set approved = true
where id = '본인-UUID';
```

6. 사이트에서 로그아웃 → 다시 로그인합니다.

## 6. 나머지 가족 계정

가족 구성원에게 사이트 주소를 공유하고 각자 회원가입하게 합니다.

각 계정은 처음에는 대기 상태입니다. 기존 승인 가족이 Supabase SQL Editor에서 `approved = true`로 바꾸면 바로 사용할 수 있습니다.

## 7. 테스트 순서

### 식당

식당 추가 → 식당 이름 입력 → 저장 → 목록에 카드가 나타나는지 확인.

### 리뷰

식당 클릭 → 내 리뷰 남기기 → 별점/코멘트/방문 날짜 → 저장.

### 다른 가족 확인

다른 이메일 계정으로 로그인 → 같은 식당과 첫 번째 가족의 리뷰가 보이는지 확인.

### 식당 수정/삭제
식당을 등록한 계정으로 상세 화면에 들어가면 `식당 수정`, `식당 삭제` 버튼이 보입니다. 다른 가족 계정에는 이 버튼이 보이지 않아야 합니다. 수정은 이름/주소/전화번호/카테고리/메모/지도·웹사이트 링크/대표 사진을 바꿀 수 있고, 삭제하면 해당 식당에 연결된 리뷰·즐겨찾기·방문 기록도 DB에서 함께 삭제됩니다.

### 즐겨찾기

내 계정에서 ❤️를 누른 뒤 다른 가족 계정으로 확인. 두 사용자의 즐겨찾기는 서로 영향을 주면 안 됩니다.

### 방문 기록

식당 상세 → 방문 기록 추가 → 방문 날짜와 가족 선택 → 저장.

### 사진

대표 사진 / 리뷰 사진 업로드 후 식당 상세에서 표시되는지 확인.

## 8. Vercel 배포

GitHub에 프로젝트 폴더를 push합니다.

Vercel → Add New Project → GitHub Repository 선택.

환경변수 2개를 등록합니다.

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Build Command는 `npm run build`, Output Directory는 `dist`입니다.

배포 후 Vercel 주소가 생깁니다.

## 9. Supabase Auth 주소 설정

Supabase → Authentication → URL Configuration에서:

- Site URL: Vercel 배포 주소
- Redirect URLs: Vercel 배포 주소 + 필요하면 localhost 주소

이메일 인증을 켜는 경우 이 설정이 특히 중요합니다.

## 10. 가족에게 공유

배포된 Vercel 주소 하나만 가족 단톡방에 공유하면 됩니다.

가족은 각자 자신의 이메일/비밀번호로 로그인합니다.

## 11. 문제가 생겼을 때

### 로그인 불가

Authentication → Providers → Email이 켜져 있는지 확인.

### 로그인은 되는데 승인 대기

`profiles.approved`가 false인지 확인.

### 식당이 0개

현재 계정이 승인 가족인지 확인하고, 브라우저 콘솔에 RLS 오류가 있는지 확인.

### 이미지 업로드 실패

Storage → Buckets → `family-images`가 있는지 확인.

### `42501` permission denied

RLS 정책 또는 grants 문제입니다. `schema.sql` 실행이 중간에 실패하지 않았는지 SQL Editor 결과를 확인.

### 환경변수 오류

`.env.local` 이름이 정확한지 확인하고 `npm run dev`를 다시 실행.

## 12. 데이터 백업

가족 데이터가 쌓이면 Supabase의 Database 백업/내보내기 기능을 함께 사용하는 것을 권장합니다.
