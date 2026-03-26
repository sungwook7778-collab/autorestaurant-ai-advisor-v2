/**
 * Cloudflare Tunnel / ngrok 등으로 dev 서버를 공개할 때,
 * 스크립트·HMR URL이 127.0.0.1 을 가리켜 ERR_CONNECTION_REFUSED 나는 문제를 완화합니다.
 * 터널을 통한 요청의 Host / X-Forwarded-* 로 server.origin · hmr 을 맞춥니다.
 * 이후 localhost 로 다시 열면 이전 origin 이 남지 않도록 설정을 되돌립니다.
 */
export function devTunnelOrigin() {
  const localLike = (host) => {
    if (!host) return true;
    const h = host.split(':')[0].toLowerCase();
    return (
      h === 'localhost' ||
      h === '::1' ||
      h.endsWith('.local') ||
      /^127\./.test(h) ||
      /^192\.168\./.test(h) ||
      /^10\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(h)
    );
  };

  const cloneHmr = (h) => (h && typeof h === 'object' ? { ...h } : h);

  return {
    name: 'dev-tunnel-origin',
    enforce: 'pre',
    configureServer(server) {
      const initial = {
        origin: server.config.server.origin,
        hmr: cloneHmr(server.config.server.hmr),
      };

      server.middlewares.use((req, _res, next) => {
        const rawForwarded = req.headers['x-forwarded-host'];
        const forwarded = rawForwarded
          ? String(rawForwarded).split(',')[0].trim()
          : '';
        const hostHeader = forwarded || req.headers.host || '';
        const hostname = hostHeader.split(':')[0];

        if (!hostname || localLike(hostname)) {
          server.config.server.origin = initial.origin;
          server.config.server.hmr = cloneHmr(initial.hmr);
          next();
          return;
        }

        const rawProto = req.headers['x-forwarded-proto'];
        const proto = rawProto
          ? String(rawProto).split(',')[0].trim().toLowerCase()
          : 'https';
        const safeProto = proto === 'http' || proto === 'https' ? proto : 'https';
        const origin = `${safeProto}://${hostHeader}`;

        server.config.server.origin = origin;

        const prev = server.config.server.hmr;
        const prevObj = prev && typeof prev === 'object' ? prev : {};
        server.config.server.hmr = {
          ...prevObj,
          protocol: safeProto === 'https' ? 'wss' : 'ws',
          host: hostname,
          clientPort: safeProto === 'https' ? 443 : 80,
        };

        next();
      });
    },
  };
}
