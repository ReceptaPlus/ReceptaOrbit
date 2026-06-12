# Recepta Orbit — Design System "Orbit UI"

> HealthTech SaaS. Derivado do manual da marca Recepta (paleta com proporções, Nexa/Montserrat, ícones preenchidos, cantos arredondados).
> Referências: Linear (densidade/velocidade), Stripe (tabelas/hierarquia), Vercel (clareza/contraste), Raycast (dark sidebar/atalhos), Clerk (formulários/auth).

---

## 1. Princípios

1. **Bege é o palco, laranja é o ator** — manual exige bege 40–50%, laranja 20–25%. Laranja só em ação primária, marca e destaque. Nunca duas ações primárias na mesma viewport.
2. **Dado confiável tem cor própria** — verde `#6FAF8F` reservado para indicadores/sucesso (definição do manual: "elementos técnicos, dashboards"). Nunca decorativo.
3. **Denso, mas respirável** — densidade Linear (linhas 44px, texto 13–14px) com respiro Stripe (cards 20–24px padding).
4. **Tudo tem estado** — hover, focus, active, disabled, loading, empty definidos para cada componente. Focus ring laranja visível sempre (a11y).
5. **IA nunca sem confiança** — qualquer dado gerado por IA acompanha ConfidencePill.

---

## 2. Cores

### Escala completa (derivada da paleta oficial)

| Token | Hex | Origem | Uso |
|---|---|---|---|
| `brand-50` | `#FEF0EE` | tint do laranja | fundos de badge/hover sutil |
| `brand-100` | `#FAD9D2` | tint | bordas de seleção |
| `brand-300` | `#E89580` | tint | gráficos secundários |
| `brand-400` | `#D97055` | **manual: laranja claro** | degradês, pesos menores |
| `brand-500` | `#D4432C` | **manual: laranja** | ação primária, links, marca |
| `brand-600` | `#B33820` | shade | hover de ação primária |
| `brand-700` | `#8F2D1A` | shade | active/pressed |
| `cream-50` | `#FFFDF5` | tint | cards sobre bege |
| `cream-100` | `#FFF5D9` | **manual: bege** | fundo da aplicação |
| `cream-200` | `#F1EBE0` | **manual: bege claro** | fundos alternados, hover de linha |
| `ink-900` | `#0A0D0C` | **manual: preto** | texto principal, sidebar |
| `ink-700` | `#1A1F1E` | tint | sidebar accent, hover dark |
| `neutral-600` | `#695C57` | **manual: cinza** | texto secundário |
| `neutral-400` | `#A89E99` | tint | placeholder, ícones inativos |
| `neutral-200` | `#E8E2D2` | tint | bordas |
| `neutral-100` | `#F0EBE0` | tint | divisores, skeleton |
| `success-500` | `#6FAF8F` | **manual: verde** | KPIs positivos, confirmado |
| `success-bg` | `#EEF7F2` | tint | fundo de badge |
| `success-text` | `#3A7D5E` | shade | texto sobre success-bg |
| `warning-bg` | `#FFF7E6` | sistema | pendência, revisão |
| `warning-text` | `#B45309` | sistema | texto de alerta |
| `danger-bg` | `#FDECEA` | sistema | erro, perda, estorno |
| `danger-text` | `#B3261E` | sistema | texto de erro |
| `info-bg` | `#EAF1FB` | sistema | orçamento, neutro-frio |
| `info-text` | `#2D5FA8` | sistema | texto info |

### Regras semânticas

| Semântica | Token |
|---|---|
| Fundo app | `cream-100` |
| Superfície (card/tabela/modal) | `#FFFFFF` |
| Superfície alternada | `cream-50` / `cream-200` (hover) |
| Texto primário | `ink-900` |
| Texto secundário | `neutral-600` |
| Texto desabilitado/placeholder | `neutral-400` |
| Borda padrão | `neutral-200` |
| Ação primária | `brand-500` → hover `brand-600` → active `brand-700` |
| Focus ring | `brand-500` a 40%, 3px |
| Degradê de destaque | `brand-500 → brand-400` (único permitido pelo manual) |
| Dark surface (sidebar) | `ink-900` + texto `#8A8E8D` + ativo `#FFFFFF` |

---

## 3. Tipografia

| Papel | Fonte | Fallback web |
|---|---|---|
| Display (títulos, KPIs, marca) | **Nexa** (manual) | Manrope 600–800 |
| Texto (corpo, tabelas, forms) | **Montserrat** (manual) | Inter 400–600 |

### Escala (base 16px, ratio ~1.2)

| Token | Tamanho/linha | Peso | Uso |
|---|---|---|---|
| `display-lg` | 28/34 | 800 display | número de KPI hero |
| `display` | 24/30 | 700 display | título de página (h1) |
| `title` | 18/24 | 700 display | título de seção/card (h2) |
| `subtitle` | 15/22 | 600 display | subtítulo, header de modal |
| `body` | 14/21 | 400 | corpo padrão |
| `body-medium` | 14/21 | 500 | célula de tabela com ênfase, label |
| `small` | 13/18 | 400 | célula de tabela, descrição |
| `caption` | 12/16 | 500 | badge, header de tabela (uppercase opcional, tracking 0.04em) |
| `micro` | 11/14 | 500 | timestamp, contador |

Números em tabelas e KPIs: `font-variant-numeric: tabular-nums` (padrão Stripe).

---

## 4. Grid & Layout

| Token | Valor |
|---|---|
| Sidebar | 240px fixa (desktop) · 64px colapsada (1024–1280px) · drawer (<768px) |
| Conteúdo | fluido, `max-width: 1440px`, padding 32px (desktop) / 16px (mobile) |
| Colunas | CSS Grid 12 col, gutter 16px |
| KPI row | 4 col → 2 (≤1280px) → 1 (≤640px) |
| Detalhe (timeline+painel) | 2fr / 1fr → empilha ≤1024px |
| Breakpoints | `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1440` |

---

## 5. Espaçamento

Escala 4px. Tokens: `1=4` `2=8` `3=12` `4=16` `5=20` `6=24` `8=32` `10=40` `12=48` `16=64`.

Aplicação fixa: padding de card `6` (24px) · gap entre cards `4` (16px) · padding de célula `4`h/`3`v · gap label→input `1.5` (6px) · seções de página `6` (24px).

---

## 6. Shadows

Sombras quentes (tingidas com o ink da marca, nunca cinza-azulado):

| Token | Valor | Uso |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(10,13,12,.05)` | inputs, linhas elevadas |
| `shadow-sm` | `0 1px 3px rgba(10,13,12,.07)` | cards |
| `shadow-md` | `0 4px 16px rgba(10,13,12,.09)` | dropdown, popover, card hover |
| `shadow-lg` | `0 8px 32px rgba(10,13,12,.13)` | modal, drawer |
| `shadow-focus` | `0 0 0 3px rgba(212,67,44,.25)` | focus ring |

Cards usam `shadow-sm` + borda `neutral-200` (Stripe: borda > sombra para hierarquia).

---

## 7. Radius

Manual: "cantos moderadamente arredondados".

| Token | Valor | Uso |
|---|---|---|
| `r-sm` | 6px | badge interno, checkbox |
| `r-md` | 8px | botão, input, célula destacada |
| `r-lg` | 12px | card, tabela, modal |
| `r-xl` | 16px | drawer, bottom sheet, card hero |
| `r-full` | 9999px | pill, avatar, toggle |

Bolha de chat: `r-lg` com canto "cauda" `r-sm` (in: inferior-esquerdo; out: inferior-direito).

---

## 8. Motion

| Token | Valor | Uso |
|---|---|---|
| `fast` | 100ms ease-out | hover, active |
| `base` | 180ms ease-out | dropdown, tooltip, badge |
| `slow` | 240ms cubic-bezier(.32,.72,0,1) | modal, drawer, sheet |

Sem animação decorativa. `prefers-reduced-motion` respeitado.

---

## 9. Componentes

### 9.1 Sidebar (ref. Raycast/Linear)
- Fundo `ink-900`, largura 240px, sticky full-height
- Item: 36px alto, `r-md`, ícone 16px + label 14px; inativo `#8A8E8D`, hover `ink-700`+branco, ativo `ink-700`+branco+barra 2px `brand-500` à esquerda
- Badge numérico à direita do item (pendências): pill `brand-500`, texto branco 11px
- Rodapé: tenant switcher (Admin) + usuário + sair
- Colapsada: só ícones 64px, tooltip à direita; atalho `[` alterna

### 9.2 Navbar / Topbar (ref. Vercel)
- Desktop: breadcrumb à esquerda (página atual `body-medium`, anteriores `neutral-600`), busca ⌘K central-direita, avatar
- Mobile: 56px, hamburger + título + busca
- Busca: input fantasma com `⌘K` kbd hint; abre command palette (navegar, buscar contato, ações)

### 9.3 Cards
- Base: branco, borda `neutral-200`, `r-lg`, `shadow-sm`, padding 24px
- Header: `title` + ação opcional à direita (link ou ícone-botão)
- Hover (se clicável): `shadow-md` + borda `brand-100`, transição `fast`
- Variantes: `default` · `interactive` (clicável) · `highlight` (borda esquerda 3px `brand-500`) · `warning` (fundo `warning-bg`, para pendências)

### 9.4 KPIs (ref. Metabase/Stripe)
- Estrutura: label `small` `neutral-600` → valor `display-lg` tabular → delta
- Delta: seta + % — positivo `success-text`, negativo `danger-text`, neutro `neutral-600`. Inversão semântica configurável (queda de custo = verde)
- Sparkline opcional 32px alto, linha `brand-400`, área 8% opacidade
- Clicável → drill-down para listagem filtrada
- Loading: skeleton 3 linhas; valor nunca "pula" (min-height fixa)

### 9.5 Tabelas (ref. Stripe)
- Container: card `r-lg` overflow-hidden; header `caption` `neutral-600` com fundo `cream-50`, borda inferior
- Linha: 44px, hover `cream-200`, inteira clicável quando há detalhe; borda `neutral-100` entre linhas
- Dinheiro: alinhado à direita, tabular-nums; status: badge; texto longo: truncate com tooltip
- Linha precisando ação: dot 6px `warning-text` à esquerda do nome
- Ordenação no header (seta), paginação no rodapé (`‹ 1 2 3 ›` + "50/página")
- Empty state: ícone + frase + CTA; Loading: 5 linhas skeleton
- Mobile: vira lista de cards (colunas-chave apenas)

### 9.6 Filtros (ref. Linear)
- Toolbar acima da tabela: FilterDropdown pills — fechado `Origem ▾` borda `neutral-200`; ativo `Origem: Meta ×` fundo `brand-50` borda `brand-100` texto `brand-600`
- SegmentedControl para período (7d/30d/90d): fundo `cream-200`, segmento ativo branco + `shadow-xs`
- Busca à direita da toolbar; filtros ativos sempre removíveis com ×; "Limpar filtros" aparece com 2+
- Estado na URL (`?origem=meta&periodo=30d`) — compartilhável

### 9.7 Modais (ref. Clerk)
- Overlay `ink-900` 40%; container branco `r-lg` `shadow-lg`, max-width 480px (confirm) / 640px (form)
- Header: `subtitle` + × (36px alvo); footer: ações à direita, primária por último
- Entrada: fade + scale 98→100 `slow`; ESC fecha (exceto se sujo: confirma descarte)
- **Uso restrito**: confirmação destrutiva e forms curtos (convidar usuário). Detalhes/edição extensa → Drawer
- Destrutivo: botão `danger`, verbo explícito ("Cancelar venda", nunca "OK")

### 9.8 Drawers (ref. Linear peek)
- Lateral direito: 480px (peek de conversa a partir da lista) / 640px (edição)
- Fundo branco, `r-xl` só à esquerda, `shadow-lg`, slide-in `slow`
- Header: título + ações + "abrir página completa ↗" (rota real — peek é atalho, não prisão)
- Mobile: vira bottom sheet 90vh com handle
- Navegação ↑↓ entre registros sem fechar (padrão Linear)

### 9.9 Badges
- Pill `r-full`, padding 10×2px, `caption` 500
- **Etapa**: Nova `brand-50/brand-600` · Em atendimento/Necessidade `warning` · Orçamento/Negociação `info` · Venda confirmada `success` · Perdida `danger` · Não classificada `neutral`
- **Origem**: Meta `brand-50/brand-600` · Google `info` · Instagram `#FDEBF4/#BE3D7F` · WhatsApp orgânico `success` · Direto/Desconhecida `neutral`
- **Venda**: Confirmada `success` · Pendente `warning` · Cancelada `neutral` · Estornada `danger`
- **ConfidencePill**: ≥85% `success` · 60–84% `warning` · <60% `danger`; tooltip "Confiança da IA: como foi classificado"
- Com dot opcional 6px à esquerda para status "vivo" (integração conectada)

### 9.10 Chat Timeline (ref. HubSpot + WhatsApp)
- Container: card padding 24px, scroll interno, mensagens mais antigas no topo
- Bolha INBOUND (cliente): esquerda, fundo `cream-200`, borda `neutral-100`, texto `ink-900`
- Bolha OUTBOUND (farmácia): direita, fundo `brand-500`, texto branco
- Max-width 75%; timestamp `micro` dentro da bolha; agrupamento: mensagens consecutivas do mesmo lado com gap 4px (vs 12px)
- Separador de dia: linha + chip central "10 de junho"
- Marcos do sistema na timeline (padrão HubSpot): chips neutros centrados — "🤖 IA classificou como Venda (91%)", "✓ Venda s-1041 confirmada por Antonio"
- AISummaryCard no topo: fundo `cream-50`, borda esquerda 3px `brand-400`, ícone + `small`

---

## 10. Tokens Tailwind (v4 — `@theme`)

```css
@import "tailwindcss";

@theme {
  /* ── Brand ─────────────────────────────────── */
  --color-brand-50:  #FEF0EE;
  --color-brand-100: #FAD9D2;
  --color-brand-300: #E89580;
  --color-brand-400: #D97055;
  --color-brand-500: #D4432C;
  --color-brand-600: #B33820;
  --color-brand-700: #8F2D1A;

  /* ── Neutrals (da marca) ───────────────────── */
  --color-cream-50:  #FFFDF5;
  --color-cream-100: #FFF5D9;
  --color-cream-200: #F1EBE0;
  --color-ink-900:   #0A0D0C;
  --color-ink-700:   #1A1F1E;
  --color-neutral-600: #695C57;
  --color-neutral-400: #A89E99;
  --color-neutral-200: #E8E2D2;
  --color-neutral-100: #F0EBE0;

  /* ── Semantic ──────────────────────────────── */
  --color-success-500: #6FAF8F;
  --color-success-bg:  #EEF7F2;
  --color-success-text:#3A7D5E;
  --color-warning-bg:  #FFF7E6;
  --color-warning-text:#B45309;
  --color-danger-bg:   #FDECEA;
  --color-danger-text: #B3261E;
  --color-info-bg:     #EAF1FB;
  --color-info-text:   #2D5FA8;

  /* ── Sidebar ───────────────────────────────── */
  --color-sidebar:       #0A0D0C;
  --color-sidebar-accent:#1A1F1E;
  --color-sidebar-text:  #8A8E8D;

  /* ── Typography ────────────────────────────── */
  --font-sans: var(--font-inter), "Montserrat", -apple-system, sans-serif;
  --font-display: var(--font-manrope), "Nexa", var(--font-inter), sans-serif;

  --text-micro: 0.6875rem;
  --text-micro--line-height: 0.875rem;
  --text-caption: 0.75rem;
  --text-caption--line-height: 1rem;
  --text-small: 0.8125rem;
  --text-small--line-height: 1.125rem;
  --text-body: 0.875rem;
  --text-body--line-height: 1.3125rem;
  --text-subtitle: 0.9375rem;
  --text-subtitle--line-height: 1.375rem;
  --text-title: 1.125rem;
  --text-title--line-height: 1.5rem;
  --text-display: 1.5rem;
  --text-display--line-height: 1.875rem;
  --text-display-lg: 1.75rem;
  --text-display-lg--line-height: 2.125rem;

  /* ── Radius ────────────────────────────────── */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* ── Shadows (quentes, tingidas de ink) ────── */
  --shadow-xs: 0 1px 2px rgba(10,13,12,.05);
  --shadow-sm: 0 1px 3px rgba(10,13,12,.07);
  --shadow-md: 0 4px 16px rgba(10,13,12,.09);
  --shadow-lg: 0 8px 32px rgba(10,13,12,.13);
  --shadow-focus: 0 0 0 3px rgba(212,67,44,.25);

  /* ── Motion ────────────────────────────────── */
  --ease-out-soft: cubic-bezier(.32,.72,0,1);

  /* ── Layout ────────────────────────────────── */
  --spacing-sidebar: 240px;
  --spacing-sidebar-collapsed: 64px;
  --spacing-topbar: 56px;
}
```

Uso: `bg-brand-500`, `text-neutral-600`, `rounded-lg`, `shadow-md`, `text-display`, `font-display`, `w-sidebar`.

---

## 11. Mapa componente → telas

| Componente | Telas |
|---|---|
| Sidebar, Navbar | shell global |
| KPI Card | Dashboard, Vendas, Ficha do cliente |
| DataTable + Filtros | Conversas, Vendas, Clientes |
| Chat Timeline + AISummaryCard | Detalhe da conversa |
| Drawer (peek) | Conversas→detalhe rápido, Vendas→detalhe |
| Modal | Confirmar/cancelar venda, Convidar usuário |
| Badges (todas) | todas as listagens + detalhes |
| ConfidencePill | toda classificação de IA |
```
