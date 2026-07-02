# IA de conversas — n8n + endpoints internos

A análise das conversas roda **fora do app**, num **n8n** dedicado, disparada por cron
(Schedule Trigger nativo do n8n). O app só **serve as conversas** e **persiste o resultado**
via endpoints internos. O n8n **nunca** acessa a Evolution/Digisac — só fala com o site.

```
n8n Schedule → GET pendentes → Claude (nó HTTP) → POST resultado → (telas /vendas e detalhe)
```

Dois workflows (importáveis nesta pasta):

| Arquivo | O que faz | Cadência sugerida |
|---|---|---|
| [orbit-ia-analise-ciclos.json](orbit-ia-analise-ciclos.json) | Classifica cada ciclo CLOSED: venda? valor? resumo. | a cada 1h |
| [orbit-ia-relatorio.json](orbit-ia-relatorio.json) | Resumo do dono (vendas × conversas) por farmácia. | diário 08h |

A chave do Claude vive **na credencial do n8n** — nunca no app.

---

## Pré-requisitos (uma vez)

### 1. Aplicar a migration no banco
A migration `20260629120000_ia_analysis` cria `cycle_analyses` e `sales_reports`.
No deploy do backend: `npx prisma migrate deploy` (ou rodar o SQL da migration na DB
compartilhada do Railway). Sem isso, os endpoints respondem 500.

### 2. Definir `IA_INGEST_SECRET` no serviço do site (Railway → ReceptaOrbit)
Gere um segredo forte e use o **mesmo valor** na credencial do n8n (passo 4).
```
openssl rand -base64 48
```
Em produção os endpoints recusam (503) sem essa env.

---

## n8n (já provisionado no Railway)

Serviço **n8n** criado no projeto *Recepta Orbit* (imagem oficial `n8nio/n8n`):

- URL: **https://n8n-production-cf2c1.up.railway.app**
- Volume persistente `n8n-volume` em `/home/node/.n8n` (guarda o SQLite + credenciais +
  a chave de criptografia auto-gerada). **Não apague o volume** — perde as credenciais.
- Envs já setadas: `N8N_HOST`, `N8N_PORT=5678`, `N8N_PROTOCOL=https`, `WEBHOOK_URL`,
  `GENERIC_TIMEZONE`/`TZ=America/Sao_Paulo`.

Primeiro acesso: abra a URL e **crie a conta de owner** (user management do n8n; o painel
fica exposto na internet — use senha forte). `N8N_ENCRYPTION_KEY` não foi fixada: o n8n gera
e guarda no volume. Se quiser portabilidade entre ambientes, defina-a explícita (e nunca mude).

> Os dois workflows não usam Webhook Trigger (só Schedule + HTTP de saída), então o n8n não
> precisa receber tráfego de entrada além do próprio painel.

---

## Configurar credenciais no n8n

Crie **duas** credenciais do tipo **Header Auth** (Credentials → New → "Header Auth"):

1. **Orbit IA x-ia-secret**
   - Name: `x-ia-secret`
   - Value: o mesmo `IA_INGEST_SECRET` do site
2. **Anthropic x-api-key**
   - Name: `x-api-key`
   - Value: sua API key da Anthropic

Os nós HTTP já referenciam esses nomes; na importação, selecione/crie cada um quando o n8n pedir.

---

## Importar e testar

1. **Importar** cada `.json` (Workflows → ⋯ → *Import from File*).
2. Confirme que a **URL base** dos nós HTTP do Orbit é a do seu site
   (default: `https://receptaorbit-production.up.railway.app`). Ajuste se o domínio for outro.
3. **Teste manual** (*Execute Workflow*) com o de análise:
   - `GET ciclos pendentes` deve voltar `{ ok:true, count, cycles }`.
   - `Claude — classificar` roda 1× por ciclo.
   - `POST resultados` grava → confira em **/vendas** e no **detalhe da conversa** (card
     "Análise da conversa").
4. Rode o de relatório uma vez → **/vendas** mostra o "Resumo do período".
5. **Ative** os workflows (toggle *Active*) para o cron passar a rodar sozinho.

---

## Endpoints internos (referência)

Todos sob `/api/internal/ia/`, auth via header `x-ia-secret`.

| Método | Rota | Corpo / Query | Resposta |
|---|---|---|---|
| GET | `cycles/pending` | `?limit=20` | `{ ok, count, cycles[] }` |
| POST | `cycles/results` | `{ results: CycleResult[] }` | `{ ok, saved }` |
| GET | `report/pending` | `?days=7` | `{ ok, count, reports[] }` |
| POST | `report` | `ReportBody` | `{ ok, id }` |

Contratos validados com Zod em `frontend/src/server/ia/schemas.ts`. Idempotência: a análise
faz `upsert` por `(cycleId, pharmacyId)`, então re-rodar o workflow não duplica.

---

## Ajustes comuns

- **Modelo**: editar `MODEL` nos nós *Code* (default `claude-sonnet-5`; `claude-haiku-4-5-20251001`
  é mais barato para classificação em escala).
- **Cadência**: editar o nó *Schedule Trigger*.
- **Lote**: `?limit=` no `GET ciclos pendentes` controla quantos ciclos por execução.
- **Regenerar os JSON**: este diretório foi gerado por script; os arquivos são editáveis à mão.
