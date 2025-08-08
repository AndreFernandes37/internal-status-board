# Home Hub — Portal Interno do Homelab (LAN)

Um dashboard minimalista (tema escuro) para links rápidos e estado de serviços do seu homelab, com métricas do host. Inclui APIs locais (Express), cache, SSE, Basic Auth, Dockerfile e docker-compose.

## Requisitos
- Node.js 20+
- Docker (opcional, recomendado para produção LAN)

## Configuração
Edite o ficheiro `config/services.json` com os seus serviços. Exemplo incluído:

```json
{
  "refreshSeconds": 15,
  "services": [
    {"name":"pfSense","url":"https://pfsense.home.arpa","method":"GET","timeoutMs":4000,"ignoreTls":true},
    {"name":"Proxmox","url":"https://proxmox.home.arpa:8006","method":"GET","timeoutMs":4000,"ignoreTls":true},
    {"name":"NPM","url":"https://npm.home.arpa","method":"GET","timeoutMs":4000,"ignoreTls":true},
    {"name":"Nextcloud","url":"https://nextcloud.home.arpa/status.php","method":"GET","timeoutMs":4000,"ignoreTls":true},
    {"name":"Nginx Server","url":"https://nginx.home.arpa","method":"GET","timeoutMs":4000,"ignoreTls":true},
    {"name":"Site Público","url":"https://www.thinkbig.pt/","method":"HEAD","timeoutMs":5000,"ignoreTls":false}
  ]
}
```

## Variáveis de Ambiente
Crie `.env` a partir de `.env.example`:

```ini
PORT=8080
BASIC_USER=admin
BASIC_PASS=trocar
NODE_ENV=production
```

## Como correr em desenvolvimento
1. Instalar deps: `npm i`
2. Build do frontend: `npm run build`
3. Arrancar o servidor (APIs + UI estática): `node server/index.js`
4. Aceder: http://<IP>:8080 — será pedido Basic Auth

Nota: Em dev, o Vite (`npm run dev`) serve apenas o frontend. As APIs ficam disponíveis pelo servidor Express (`server/index.js`). Para a experiência completa (SSE, Basic Auth, cache), use o servidor Express acima ou Docker.

## Docker
Build e run com Compose:

```bash
docker compose up -d --build
```

- Serviço: `hub` exposto em `0.0.0.0:8080`
- Basic Auth obrigatório (defina `BASIC_USER` e `BASIC_PASS`)
- `config/services.json` é montado como read-only; pode editá-lo sem rebuild

Aceda: `http://<IP>:8080`

## APIs
- `GET /api/health` — lê `config/services.json`, faz checks (GET/HEAD), timeout, opção `ignoreTls`, cache 10s. Query `?force=true` ignora cache.
- `GET /api/health/stream` — SSE a cada `refreshSeconds`
- `GET /api/system` — métricas: load, CPU, RAM, disco root, uptime, IP LAN, temperatura (se disponível)
- `GET /api/system/stream` — SSE a cada 5s

Todos os endpoints e UI exigem Basic Auth. Sem CORS (mesma origem).

## Nginx Proxy Manager
- Configure um Proxy Host `hub.home.arpa → hub:8080`
- Ative apenas na LAN; para acesso externo, use VPN

## Qualidade
- TypeScript no frontend, tema escuro com Tailwind e tokens semânticos
- Lint/format conforme configuração do projeto
- Tratamento de indisponibilidade visível (pílulas de estado e mensagens)

## Notas
- Certificados self-signed são aceites por serviço quando `ignoreTls: true`
- Temperatura: se não disponível, UI mostra “sensor indisponível”
- Sem trackers nem fontes externas (usa fontes do sistema)
