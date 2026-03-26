# Vercel 배포 가이드 (FreeKit ROI 시뮬레이터)

정적 빌드 **`dist/`** 를 Vercel에 올립니다. 루트의 **`vercel.json`** 이 빌드 명령·출력 폴더·SPA용 리라이트를 지정합니다.

## 1. GitHub에 코드 올리기

저장소가 없다면 생성한 뒤 이 프로젝트를 push 합니다.

## 2. Vercel에서 프로젝트 연결

1. [vercel.com](https://vercel.com) 로그인 → **Add New…** → **Project**
2. **Import** 할 Git 저장소 선택
3. 설정 확인 (대부분 자동):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `./` (모노레포가 아니면 비움)
4. **Deploy** 클릭

첫 배포 후 `https://<프로젝트명>.vercel.app` 주소가 생성됩니다.

## 3. Node 버전

- **Project → Settings → General → Node.js Version** 에서 **20.x** 권장  
- 또는 저장소의 **`.nvmrc`**(`20`)를 Vercel이 읽습니다.

## 4. 로컬에서 미리 확인

```bash
npm ci
npm run build
npm run preview
```

## 5. CLI로 배포 (선택)

```bash
npx vercel login
npx vercel              # 프리뷰
npx vercel --prod       # 프로덕션
```

또는:

```bash
npm run deploy:vercel
```

## 6. 커스텀 도메인

**Project → Settings → Domains** 에서 도메인 추가 후 안내에 따라 DNS를 연결합니다.

---

### 참고 (다른 플랫폼)

- **Netlify:** 루트 `netlify.toml`
- **Cloudflare Pages:** `wrangler.toml`, `npm run deploy:cf-pages`
- **GitHub Pages:** `base: './'` 로 프로젝트 사이트 경로에 적합

### 체크리스트

| 항목 | 설명 |
|------|------|
| 빌드 | `npm run build` 성공 시 `dist/` 생성 |
| SPA | `vercel.json` 의 `rewrites` 로 직접 URL도 `index.html` |
| 비밀키 | 이 앱은 프론트만 있음 — API 키를 저장소에 넣지 마세요 |

빌드가 실패하면 Vercel **Deployments → 해당 배포 → Building → Logs** 에서 오류를 확인하세요.
