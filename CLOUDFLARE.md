# Cloudflare Tunnel로 웹에 공개하기

## 1. cloudflared 설치 (한 번만)

**Windows (winget)**

```powershell
winget install --id Cloudflare.cloudflared -e
```

설치 후 **새 터미널**을 열어 `cloudflared --version` 이 출력되는지 확인하세요.

**직접 다운로드**  
[Cloudflare 공식 다운로드](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) 에서 Windows용 `cloudflared` 를 받아 PATH에 넣어도 됩니다.

---

## 2. 누구나 볼 수 있는 임시 주소 (계정 불필요, 가장 빠름)

로컬에서 Vite와 터널을 같이 띄웁니다.

**포트:** 이 프로젝트의 Vite 개발 서버 기본 포트는 **`5183`** 입니다.  
`npm run dev` · `npm run dev:cloudflare` 모두 **같은 포트**를 쓰므로, 터미널에서 서버를 띄운 뒤 **`http://localhost:5183`** 으로 열면 됩니다.  
(서버를 끈 상태에서 5183만 열면 `ERR_CONNECTION_REFUSED` 가 납니다.)

```bash
npm run dev:cloudflare
```

터미널 **`tunnel`** 쪽에 다음과 비슷한 줄이 나옵니다.

```text
https://xxxx-xxxx.trycloudflare.com
```

이 URL을 브라우저로 열면 인터넷 어디서나 접속할 수 있습니다.  
터널을 끄면 주소는 더 이상 동작하지 않으며, 다시 실행할 때마다 주소가 바뀔 수 있습니다.

**빌드 미리보기만 공개**할 때:

```bash
npm run build
npm run preview:cloudflare
```

---

## 3. 고정 도메인 (예: `roi.내도메인.com`) — Cloudflare 계정 필요

다음이 준비되어 있어야 합니다.

1. **Cloudflare에 네임서버를 맡긴 도메인** (DNS가 Cloudflare에서 관리되는 상태)
2. **Zero Trust**에서 만든 **Named Tunnel** (또는 `cloudflared tunnel create` 로 생성)
3. 터널용 **credentials JSON** 파일 경로
4. 공개할 **호스트명** (예: `roi.example.com`)

### 진행 순서 (요약)

1. 터미널에서 `cloudflared tunnel login` 실행 → 브라우저로 Cloudflare 계정 연결  
2. `cloudflared tunnel create freekit-roi` (이름은 원하는 대로)  
3. 생성된 **Tunnel ID**와 `%USERPROFILE%\.cloudflared\*.json` 경로 확인  
4. `cloudflared\config.example.yml`을 복사해 `cloudflared\config.yml`로 저장 후 값 수정  
5. Cloudflare DNS에 `roi` → CNAME → `<터널ID>.cfargotunnel.com` (대시보드 안내와 동일)  
6. 실행:

```bash
npm run dev:cloudflare:named
```

`config.yml`과 `*.json` credential 파일은 **Git에 커밋하지 마세요.**

---

## 4. 문제 해결

| 증상 | 조치 |
|------|------|
| `cloudflared`를 찾을 수 없음 | 설치 후 터미널 재시작, PATH 확인 |
| `Port 5183 is already in use` | 다른 프로그램이 5183을 쓰는지 확인 후 종료하거나, 해당 터미널의 이전 `dev:cloudflare` 프로세스를 종료(Ctrl+C) |
| `localhost:5183` 인데 전부 `ERR_CONNECTION_REFUSED` | 터미널에서 **`npm run dev`** 또는 **`npm run dev:cloudflare`** 가 **실행 중**인지 확인하세요. 둘 다 포트 **5183**을 사용합니다. |
| trycloudflare 접속 지연 | 1~2분 후 다시 시도 |
| 콘솔에 `ERR_CONNECTION_REFUSED`, `@vite/client` / `main.jsx` 로드 실패 | 터널 주소로 접속할 때 Vite가 로컬 URL을 쓰던 문제를 `vite-plugins/devTunnel.js` 로 보정합니다. **터미널을 재시작한 뒤** `npm run dev:cloudflare` 를 다시 실행하고, 브라우저에서 **강력 새로고침**(Ctrl+Shift+R)을 해 보세요. 그래도 안 되면 `npm run build` 후 `npm run preview:cloudflare` 로 정적 미리보기를 공개하는 편이 가장 안정적입니다. |

영구 공개·HTTPS 고정 주소는 **Cloudflare Pages / Workers** 등에 `npm run build` 결과(`dist`)를 배포하는 방식도 고려할 수 있습니다.
