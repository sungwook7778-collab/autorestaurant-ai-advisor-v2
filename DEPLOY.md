# Vercel 연동 가이드 (sungwook7778-collab)

스크린샷 기준으로 Vercel에 **sungwook7778-collab** 조직의 GitHub 저장소와 연결해 배포하는 절차입니다.

## 준비됨 (이 저장소)

- 브랜치 **`main`** 초기 커밋 완료 (`git init` + 첫 커밋)
- 루트 **`vercel.json`**: Vite 빌드 → `dist`, SPA 리라이트
- **`.nvmrc`**: Node 20

---

## 1) GitHub에 저장소 만들기

1. GitHub에서 **New repository** (조직 **`sungwook7778-collab`** 선택 권장)
2. 저장소 이름 예: **`freekit-roi-simulator`** (비어 있는 저장소, README 추가 안 함)
3. 로컬에서 원격 연결 후 푸시:

```bash
cd "D:\ROI Simulator"
git remote add origin https://github.com/sungwook7778-collab/freekit-roi-simulator.git
git push -u origin main
```

(SSH를 쓰면 `git@github.com:sungwook7778-collab/freekit-roi-simulator.git` 로 바꿉니다.)

---

## 2) Vercel 대시보드에서 연결

1. [vercel.com](https://vercel.com) → 우측 상단 **Add New…** → **Project**
2. **Import Git Repository** 목록에서 **`sungwook7778-collab/freekit-roi-simulator`** 선택  
   - 안 보이면 **Adjust GitHub App Permissions** 로 조직 저장소 접근 허용
3. **Configure Project** 확인:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`  
   (`vercel.json`이 있으면 대부분 자동으로 맞습니다.)
4. **Team:** 본인 팀(예: *sungwook jo's projects*) 또는 조직 정책에 맞게 선택
5. **Deploy** 클릭

배포가 끝나면 **`https://freekit-roi-simulator.vercel.app`** 같은 URL이 생성됩니다 (이름은 프로젝트명에 따라 다름).

---

## 3) 이후 수정 반영

`main`에 푸시할 때마다 Vercel이 자동으로 다시 빌드합니다.

---

## 4) 설정 확인

| 항목 | 값 |
|------|-----|
| Node | **20.x** (Project → Settings → General → Node.js Version) |
| 빌드 | `npm run build` |
| 출력 | `dist` |

---

## 기존 빈 Vercel 프로젝트에 붙이고 싶을 때

예: **`autorestaurant-ai-advisor-v4`** 처럼 이미 만든 프로젝트가 있다면:

1. 해당 프로젝트 → **Settings** → **Git**
2. **Connect Git Repository** → 위에서 만든 **`sungwook7778-collab/freekit-roi-simulator`** 연결  
   (또는 새 Import로 같은 이름의 프로젝트를 새로 만드는 편이 더 단순합니다.)

---

## 로컬 CLI (선택)

```bash
npx vercel login
npx vercel link    # 팀·프로젝트 선택
npm run deploy:vercel
```

---

### 다른 플랫폼

- Netlify: `netlify.toml`
- Cloudflare Pages: `npm run deploy:cf-pages`
