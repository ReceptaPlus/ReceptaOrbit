# Orbit UI — Biblioteca Oficial de UX

> Design System SaaS do Recepta Orbit. Fundações em `globals.css` (tokens da marca) + primitivos shadcn/Radix.
> Convenções globais: radius 12px em cards e 8px em controles · foco visível laranja (`--shadow-focus`) · toque ≥44px no mobile · dinheiro sempre centavos→BRL tabular à direita · verde apenas indicador, nunca ação.

Estados canônicos que TODO componente de dados implementa: **default · hover · focus · loading · empty · error · disabled**.

---

## Núcleo de dados

### Data Table
- **Finalidade:** listagens densas (conversas, vendas, clientes, usuários) com semântica consistente.
- **Comportamento:** TanStack headless; sorting por coluna (indicador ↑↓), paginação client (server quando houver API); linha inteira clicável navega ao detalhe; coluna de valor alinhada à direita com `tabular-nums`; linha com `needsReview` recebe fundo `cream-50`.
- **Estados:** loading (Skeleton de linhas), empty ("Nenhum resultado." + ação limpar filtros), error (faixa com retry), linha hover `bg-subtle`.
- **Acessibilidade:** `<caption>` sr-only descrevendo a tabela; header com `aria-sort`; linha clicável com `tabIndex=0` + Enter/Espaço; nunca informação só por cor.
- **Responsividade:** <768px NÃO espreme colunas — troca para Card List (componente irmão) com os 4 campos prioritários.

### Filters
- **Finalidade:** restringir listagens por dimensão (período, origem, etapa, status, revisão).
- **Comportamento:** dropdown facetado multi-select por coluna; chips ativos visíveis acima da tabela com ✕ individual + "Limpar tudo"; estado refletido na URL (`?origem=meta`) para link compartilhável.
- **Estados:** fechado, aberto, com seleção (contador no botão: "Origem · 2"), desabilitado quando a coluna não existe no contexto.
- **Acessibilidade:** botão com `aria-expanded`/`aria-haspopup`; opções como checkboxes reais; chips removíveis por teclado.
- **Responsividade:** trilho horizontal rolável com scroll-snap; alternativa "Filtros" único que abre Drawer no mobile.

### Search Bar
- **Finalidade:** busca local da listagem (Clientes) — distinta da busca global (Command Palette).
- **Comportamento:** filtra com debounce 300ms; ✕ limpa; Esc limpa e devolve foco; mostra contagem de resultados.
- **Estados:** vazio (placeholder com exemplo: "Buscar nome ou telefone…"), digitando, sem resultados (empty state da tabela), erro ignorado (filtro client).
- **Acessibilidade:** `role="searchbox"`, label associado, resultado anunciado via `aria-live="polite"` ("4 clientes encontrados").
- **Responsividade:** full-width acima da lista no mobile; 256px na toolbar desktop.

### Pagination
- **Finalidade:** navegar páginas da Data Table.
- **Comportamento:** "Página X de Y" + Anterior/Próxima; aparece só com >1 página; preserva filtros e ordenação.
- **Estados:** botões disabled nos extremos; loading bloqueia avanço.
- **Acessibilidade:** `<nav aria-label="Paginação">`; estado disabled real (não só visual).
- **Responsividade:** idêntico — alvos já são ≥44px.

### KPI Cards
- **Finalidade:** número-resposta com contexto ("Total vendido", "Pendentes").
- **Comportamento:** valor display (Poppins 24px) + label + delta; variante alerta (fundo `warning-bg`) quando exige ação; card inteiro clicável faz drill-down à listagem filtrada.
- **Estados:** default, alerta, loading (skeleton do número), erro ("—" + tooltip "não foi possível calcular"), zero significativo ("R$ 0,00" é dado, não vazio).
- **Acessibilidade:** delta com texto explícito ("+12% vs. período anterior"), nunca só seta verde; clicável = link real.
- **Responsividade:** grid 4→2→2; valor nunca trunca (reduz fonte antes).

---

## Feedback e sobreposição

### Toast
- **Finalidade:** confirmar resultado de ação sem bloquear ("Venda confirmada — R$ 210,00").
- **Comportamento:** sonner bottom-right; sucesso 4s, erro persiste até dispensar; ação opcional "Desfazer" 5s para mutações otimistas; máx. 3 empilhados.
- **Estados:** success, error, warning, info, com-ação.
- **Acessibilidade:** `aria-live="polite"` (sucesso) / `assertive` (erro); dispensável por teclado; nunca é o ÚNICO registro de erro de formulário.
- **Responsividade:** bottom-center acima das tabs no mobile.

### Modal (Dialog)
- **Finalidade:** tarefa focada sem perder contexto (convidar usuário, corrigir classificação).
- **Comportamento:** Radix Dialog; fecha por ✕, Esc e clique no overlay (exceto com form sujo → pede confirmação); um modal por vez, sem empilhar.
- **Estados:** aberto, submitting (botões disabled + spinner no primário), erro inline no corpo.
- **Acessibilidade:** focus trap, foco inicial no primeiro campo, retorno do foco ao gatilho, `aria-labelledby` no título.
- **Responsividade:** <768px vira sheet full-width ancorado embaixo (max-h 90vh, conteúdo rolável).

### Drawer
- **Finalidade:** detalhe rápido sem sair da listagem (peek de conversa, padrão Linear) e recipiente de filtros no mobile.
- **Comportamento:** lateral direita 420px desktop / bottom sheet mobile; rota permanece; "Abrir página completa" no header.
- **Estados:** aberto, loading (skeleton interno), erro com retry.
- **Acessibilidade:** mesmas regras do Modal; gesto de arrastar tem alternativa em botão.
- **Responsividade:** desktop lateral · mobile inferior com alça.

### Confirmation Dialog
- **Finalidade:** fricção proporcional ao risco em ações destrutivas.
- **Comportamento:** 2 níveis — **simples** (cancelar venda: título + consequência + botão destructive) e **reforçado** (desconectar WhatsApp: digitar nome da integração para habilitar o botão). Botão seguro tem o foco inicial; o destrutivo nunca é o default do Enter.
- **Estados:** aberto, confirmável (input válido), executando, erro.
- **Acessibilidade:** `role="alertdialog"`; consequência descrita em texto ("isso interrompe a coleta de conversas").
- **Responsividade:** central sempre (não vira sheet — momento de atenção).

### Empty State
- **Finalidade:** transformar "nada aqui" em orientação.
- **Comportamento:** 3 variantes — **onboarding** (primeiro uso: ícone + explicação + CTA "Conectar WhatsApp"), **filtro** (sem resultado: "Nenhuma conversa com esses filtros" + limpar), **sucesso** (fila zerada: "Tudo revisado ✓").
- **Estados:** as 3 variantes; ilustração opcional (pattern da marca, discreto).
- **Acessibilidade:** heading real (h2) + parágrafo; CTA é botão/link verdadeiro.
- **Responsividade:** centralizado, max-w 360px, padding generoso.

### Error State
- **Finalidade:** falha recuperável sem beco sem saída.
- **Comportamento:** inline (campo), seção (card com "Tentar novamente"), página (`error.tsx` com marca + voltar ao dashboard); mensagem diz o que fazer, não o stack.
- **Estados:** retry idle / retrying.
- **Acessibilidade:** `role="alert"` no surgimento; foco vai ao container do erro de página.
- **Responsividade:** igual em todos os tamanhos.

### Skeleton
- **Finalidade:** percepção de velocidade na carga inicial.
- **Comportamento:** espelha o layout final (linhas de tabela, grade de KPI, bolhas de chat); pulse sutil; troca atômica pelo conteúdo (sem flash).
- **Estados:** único; some em <200ms de resposta (evitar flicker).
- **Acessibilidade:** `aria-busy="true"` no container; conteúdo fake `aria-hidden`.
- **Responsividade:** acompanha o grid do conteúdo real.

---

## Domínio Recepta

### Chat Timeline
- **Finalidade:** reproduzir a conversa WhatsApp com fidelidade de leitura.
- **Comportamento:** bolhas IN à esquerda (neutras) / OUT à direita (laranja); hora por bolha; separador de data; resumo da IA ancorado ao fim com ícone ✦; auto-scroll ao fim na abertura.
- **Estados:** carregando (skeleton de bolhas), vazio ("ciclo sem mensagens"), mensagem não entregue (futuro: ícone + retry).
- **Acessibilidade:** `role="log"`; cada bolha com prefixo sr-only "Cliente:" / "Farmácia:"; contraste branco-sobre-laranja validado (texto ≥14px).
- **Responsividade:** bolhas max-w 75%; full-bleed no mobile.

### Audit Timeline
- **Finalidade:** trilha "quem mudou o quê" em ciclo/venda (confiança no número).
- **Comportamento:** lista cronológica decrescente: avatar + autor (ou "IA") + ação + antes→depois + timestamp; entrada de IA mostra confiança.
- **Estados:** vazio ("nenhuma alteração manual"), loading, erro.
- **Acessibilidade:** `<ol>` semântica; diff descrito em texto ("valor alterado de R$ 89,00 para R$ 95,00").
- **Responsividade:** coluna única sempre.

### Confidence Pill
- **Finalidade:** expor a certeza da IA em toda classificação (regra do produto: IA nunca sem confiança).
- **Comportamento:** verde ≥85% · âmbar 60–84% · vermelho <60%; tooltip "Confiança da IA na classificação".
- **Estados:** 3 faixas + indeterminado ("—").
- **Acessibilidade:** texto sempre presente (percentual), cor é reforço; `aria-label="confiança 91 por cento"`.
- **Responsividade:** tamanho único.

### Source/Stage/Status Badges
- **Finalidade:** vocabulário visual fixo de origem (8), etapa (8), status (5), resultado (6), papel (3).
- **Comportamento:** cor por família fixa (Meta=laranja, Google=azul, Instagram=rosa, WhatsApp=verde, neutros=bege); nunca recebem hover de ação (não parecem botões).
- **Estados:** único por valor do enum.
- **Acessibilidade:** par fundo-claro/texto-escuro da mesma família (AA); label do enum por extenso.
- **Responsividade:** quebram em flex-wrap nos cards.

---

## Formulários

### Form Components (Input, Select, Checkbox, Toggle, FormField)
- **Finalidade:** entrada de dados consistente (RHF + Zod + shadcn Form).
- **Comportamento:** label sempre visível em cima; validação on-blur, revalidação on-change após erro; erro substitui hint abaixo do campo; obrigatórios marcados no label; submit com pending state.
- **Estados:** default, focus (ring laranja), erro (borda danger + mensagem), disabled, readonly, pending.
- **Acessibilidade:** label `htmlFor`, erro via `aria-describedby` + `aria-invalid`; mensagens específicas ("CNPJ no formato 00.000.000/0000-00"), nunca "campo inválido".
- **Responsividade:** grid 2 col desktop → 1 col mobile; altura 44px.

### Money Input
- **Finalidade:** valores monetários sem ambiguidade (ajustar valor de venda).
- **Comportamento:** máscara BRL na digitação ("R$ 89,00"); armazena centavos int; vazio ≠ zero.
- **Estados:** os de Input + formatado/em edição.
- **Acessibilidade:** `inputmode="decimal"`; valor anunciado por extenso no label.
- **Responsividade:** teclado numérico no mobile.

### Multi Select
- **Finalidade:** seleção múltipla com busca (origens no filtro, papéis no convite).
- **Comportamento:** popover com busca + checkboxes; selecionados como chips removíveis no gatilho; "n selecionados" quando >3.
- **Estados:** vazio, com seleção, busca sem resultado, disabled.
- **Acessibilidade:** `role="listbox"` `aria-multiselectable`; navegação por setas; chip removível por Backspace/✕ focável.
- **Responsividade:** popover desktop → Drawer inferior mobile.

### Upload Component *(reservado — sem fluxo no escopo atual)*
- **Finalidade:** anexos futuros (ex.: comprovante de venda manual).
- **Comportamento:** zona drag&drop + botão; preview, progresso por arquivo, remover; restrições visíveis antes do erro ("PNG/PDF até 5MB").
- **Estados:** idle, dragover, uploading (progresso), sucesso, erro por arquivo (retry individual).
- **Acessibilidade:** input file real por trás (teclado funciona sem drag); progresso via `aria-valuenow`.
- **Responsividade:** zona vira botão simples no mobile (drag não existe no touch).

---

## Navegação e produtividade

### Command Palette (⌘K)
- **Finalidade:** navegação e busca global para usuário frequente.
- **Comportamento:** Ctrl/⌘K abre; grupos "Ir para" + "Contatos"; fuzzy match; Enter navega; também acessível por botão de lupa visível (descoberta).
- **Estados:** vazio (sugestões padrão), digitando, sem resultado ("Nada encontrado."), carregando resultados remotos (futuro).
- **Acessibilidade:** cmdk gerencia `aria-activedescendant`; anuncia contagem; Esc fecha devolvendo foco.
- **Responsividade:** full-screen no mobile com botão na topbar.

### Sidebar / Bottom Tabs *(já implementados — contrato)*
- Sidebar 240→64px com tooltip nos ícones colapsados; badges numéricos derivados de dados; indicador ativo em degradê.
- Bottom tabs 4 destinos, badge, `aria-current="page"`, safe-area.

---

## Governança

- Componente novo entra aqui ANTES do código: finalidade, estados e acessibilidade definidos por escrito.
- Tela nenhuma cria variante local de cor/raio/espçamento — só tokens.
- Toda ação assíncrona: pending no gatilho + toast no resultado + erro recuperável.
- Checklist de PR de UI: estados canônicos cobertos? teclado? mobile? texto sem depender de cor?
