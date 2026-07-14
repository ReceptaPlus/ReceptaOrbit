# IA de conversas — n8n + endpoints internos

A análise das conversas roda **fora do app**, num **n8n** dedicado. Desde a virada de custo,
o disparo é **por entrada no app** (não mais cron): quando um usuário de farmácia abre o app
(dashboard layout — login novo OU sessão persistida), o app chuta o webhook do n8n **só para a
farmácia dele**. Farmácia sem uso = zero custo de Claude. O app só **serve as conversas** e
**persiste o resultado**; o n8n **nunca** acessa a Evolution/Digisac.

```
Entrada no app → Webhook n8n (por pharmacyId) → GET pendentes → Claude (nó HTTP) → POST resultado → (telas /vendas e detalhe)
```

Por que entrada-no-app em vez de cron:
- **Análise de ciclos** é idempotente (1×/ciclo, `upsert`); o cron horário só adiava, não
  economizava. Farmácias inativas nunca são analisadas.
- **Relatório** era o vazamento real: o cron diário regerava a narrativa de toda farmácia
  ativa todo dia. Agora só regera quando há **análise nova** desde o último relatório
  (gate de staleness em `fetchReportInputs`).
- **Cooldown DURÁVEL (não mais throttle em memória)**: o disparo vive no dashboard layout, não
  no `loginAction` — assim vale para sessão persistida (JWT 7d), não só re-login. Uma trava
  atômica em banco (`pharmacies.last_ai_run_at`, `updateMany` condicional) garante **no máx. 1
  disparo por farmácia a cada 24h**, entre réplicas e sobrevivendo a deploy. Ver
  [`triggerPharmacyAnalysis`](../../frontend/src/server/ia/trigger.ts). Isso resolve os dois
  extremos: múltiplos logins **não** viram múltiplas análises, e a análise **não** fica presa a
  1×/sessão de 7 dias.

Dois workflows (importáveis nesta pasta), ambos disparados pela **mesma entrada no app**:

| Arquivo | O que faz | Trigger |
|---|---|---|
| [orbit-ia-analise-ciclos.json](orbit-ia-analise-ciclos.json) | Classifica cada ciclo CLOSED: venda? valor? resumo. | Webhook `orbit-ia-analise-ciclos` |
| [orbit-ia-relatorio.json](orbit-ia-relatorio.json) | Resumo do dono (vendas × conversas) por farmácia. | Webhook `orbit-ia-relatorio` |

A chave do Claude vive **na credencial do n8n** — nunca no app.

> **Relatório pode ficar 1 janela atrás:** os 2 webhooks disparam em paralelo, então a narrativa
> reflete as análises da janela anterior. O gate de staleness mantém correto (só não "ao vivo").
> Se quiser same-window, encadeie: no fim do workflow de ciclos, um nó HTTP chamando o webhook
> do relatório.

---

## Pré-requisitos (uma vez)

### 1. Aplicar as migrations no banco
- `20260629120000_ia_analysis` cria `cycle_analyses` e `sales_reports`.
- `20260714120000_pharmacy_ai_cooldown` adiciona `pharmacies.last_ai_run_at` (trava de cooldown
  do disparo). **Sem ela o disparo quebra** (o app grava nessa coluna ao reivindicar a janela).
No deploy do backend: `npx prisma migrate deploy` (ou rodar o SQL na DB compartilhada do Railway).

### 2. Definir `IA_INGEST_SECRET` no serviço do site (Railway → ReceptaOrbit)
Gere um segredo forte e use o **mesmo valor** na credencial do n8n (passo 4). Esse mesmo
segredo autentica os dois sentidos: app→n8n (header auth do webhook) e n8n→app (endpoints).
```
openssl rand -base64 48
```
Em produção os endpoints recusam (503) sem essa env.

### 3. Definir `IA_TRIGGER_WEBHOOK_URL` no serviço do site (após ativar os workflows)
Lista separada por vírgula com as **duas** URLs de webhook de produção do n8n (passo *Importar
e testar*). O login dispara ambas com `{ pharmacyId }`. **Sem essa env, o disparo é no-op** —
nenhuma análise roda (útil em dev/local; em produção, defina).
```
IA_TRIGGER_WEBHOOK_URL=https://n8n-production-cf2c1.up.railway.app/webhook/orbit-ia-analise-ciclos,https://n8n-production-cf2c1.up.railway.app/webhook/orbit-ia-relatorio
```

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

1. **Importar** cada `.json` (Workflows → ⋯ → *Import from File*). Cada um agora entra por um
   nó **Webhook (login)** (POST), não mais por Schedule.
2. No nó **Webhook (login)** de cada workflow, confirme que **Authentication = Header Auth**
   apontando para a credencial `Orbit IA x-ia-secret` (mesma do passo 4). Assim só o app,
   que envia `x-ia-secret`, consegue disparar.
3. Confirme que a **URL base** dos nós HTTP do Orbit é a do seu site
   (default: `https://receptaorbit-production.up.railway.app`). Ajuste se o domínio for outro.
4. **Ative** os dois workflows (toggle *Active*). Só ativo o webhook de **produção** existe;
   copie a *Production URL* de cada nó Webhook (formato
   `.../webhook/orbit-ia-analise-ciclos` e `.../webhook/orbit-ia-relatorio`).
5. Cole as duas em `IA_TRIGGER_WEBHOOK_URL` (vírgula-separadas) no serviço do site e redeploy.
6. **Teste**: faça **login** no app com um usuário de farmácia com ciclos CLOSED. Em segundos
   o n8n executa (veja em *Executions*): `GET pendentes` → `Claude` → `POST`. Confira em
   **/vendas** e no **detalhe da conversa** (card "Análise da conversa") + "Resumo do período".
   - Teste avulso sem login: `curl -X POST -H "x-ia-secret: <segredo>" -H "content-type: application/json" -d '{"pharmacyId":"<id>"}' <webhook-url>`.

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

- **Modelo**: editar `MODEL` nos nós *Code* (default `claude-haiku-4-5-20251001`; mais barato para
  classificação em escala. Trocar por `claude-sonnet-5` se precisar de mais qualidade).
- **Disparo**: por entrada no app (webhook), não cron. O app dispara em [`triggerPharmacyAnalysis`](../../frontend/src/server/ia/trigger.ts),
  travado por cooldown durável de **24h/farmácia** (constante `COOLDOWN_MS`; ajuste ali para mudar
  frescor × custo). Para voltar a ter um cron de rede-de-segurança, adicione um Schedule Trigger
  que faça POST no próprio webhook **sem** `pharmacyId` (varre todas).
- **Lote + drenagem**: `?limit=100` no `GET ciclos pendentes` por passada. O workflow de ciclos
  tem um **loop** (nó *Tem mais?* → volta pro GET) que drena TODO o backlog em **uma** execução,
  não 100/dia. Guard: para quando o lote vem < 100 ou após 50 iterações (`$runIndex`). A primeira
  análise de uma farmácia com histórico longo = 1 execução mais demorada (minutos, em segundo
  plano — ninguém espera; a tela /vendas mostra "Analisando N conversas…" e atualiza sozinha).
- **Escopo**: `?pharmacyId=` (injetado pelo webhook via `{{ $json.body.pharmacyId }}`) limita à
  farmácia de quem logou; vazio = todas (retrocompatível).
- **Regenerar os JSON**: este diretório foi gerado por script; os arquivos são editáveis à mão.
