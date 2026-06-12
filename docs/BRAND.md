# Recepta — Manual da Marca (consolidado)

> Fonte: manual oficial (design: Pedro Scamilla). Imagens em `C:\Users\Unknown User\Downloads\recepta-brand-assets\`.
> Este arquivo é a referência de marca para o frontend do Recepta Orbit.

## Conceito

**"A Receita para Crescer"** — duplo sentido: receita como prescrição (farmácia) + receita como crescimento financeiro.

O símbolo **"+"** representa: mais vendas, mais clientes, mais eficiência, mais tecnologia, mais crescimento — e conecta ao universo da saúde.

**Slogan:** *A receita certa para farmácias.*

## Fundamentos

| | |
|---|---|
| **Propósito** | Modernizar o crescimento de farmácias locais |
| **Posicionamento** | Não é agência — é assessoria de crescimento (marketing + vendas + tecnologia). "Enquanto o mercado vende campanhas, a Recepta entrega estrutura." |
| **Missão** | Crescimento previsível para farmácias via marketing, dados e automação |
| **Visão** | Principal referência nacional em crescimento estruturado para farmácias |
| **Valores** | Inovação · Confiabilidade · Crescimento · Parceria de longo prazo · Consistência acima de promessas |
| **Personalidade** | Inteligente · Confiável · Estratégica · Moderna · Próxima |
| **Público** | Farmácias locais que querem crescer com previsibilidade; donos que já validaram o mercado e precisam evoluir a operação |

## Paleta principal (com proporções de uso)

| Cor | Hex | Proporção | Papel |
|---|---|---|---|
| Bege | `#FFF5D9` | 40–50% | Base — fundos e áreas de respiro |
| Laranja | `#D4432C` | 20–25% | Principal — energia, destaque, guia a atenção |
| Preto | `#0A0D0C` | 15–20% | Estrutural — contraste e legibilidade |
| Cinza | `#695C57` | 10–15% | Neutra — textos e elementos secundários |

## Cores de apoio (subordinadas à paleta principal)

| Cor | Hex | Uso |
|---|---|---|
| Bege Claro | `#F1EBE0` | Fundos complementares, contraste suave com bege principal |
| Laranja Claro | `#D97055` | Transições suaves, degradês (laranja → laranja claro), elementos com menor peso |
| Verde | `#6FAF8F` | **Elementos técnicos/funcionais: dashboards, interfaces, indicadores.** Uso discreto, sem excesso de destaque |

## Tipografia

| Fonte | Papel | Pesos | Aplicações |
|---|---|---|---|
| **Nexa** | Primária | Light 300 · Regular 400 · Bold 500 · Extrabold 700 | Títulos, subtítulos, elementos de destaque |
| **Montserrat** | Secundária | Light 300 · Regular 400 · Medium 500 · SemiBold 600 | Corpo de texto, legendas, informações complementares |

> No app web: Nexa não está no Google Fonts → fallback atual Manrope (display) + Inter (corpo). Para fidelidade total, self-host Nexa ou Adobe Fonts; Montserrat está disponível no Google Fonts.

## Logotipo

- **Principal:** wordmark "Recepta" — usar sempre que possível
- **Reduzida Prioritária:** monograma "R" com "t" integrado — redes sociais, ícones, aplicações digitais; mínimo 56px/14mm
- **Reduzida Secundária:** "Rt" lado a lado — reduções críticas, baixa legibilidade; mínimo 40px/10mm
- **Horizontal:** mínimo 120px/30mm
- **Negativas:** para fundos escuros/baixa luminosidade
- **Área de proteção:** X = altura da cruz do "t" (horizontal); Y = largura da perna esquerda do "R" (reduzidas)

**Proibido:** distorcer, alterar cores fora da paleta, baixo contraste, fundos poluídos, sombra/gradiente/contorno no logo, rotacionar, trocar tipografia.

## Iconografia

- Formas **preenchidas** e objetivas, construção limpa e minimalista
- Cantos **moderadamente arredondados**, espessuras consistentes
- **Evitar:** traços finos, excesso de detalhe, aparência técnica exagerada, formas rígidas/quadradas

## Elementos gráficos

| Elemento | Função |
|---|---|
| Grids curvados | Fluxo e conexão visual |
| Linhas arredondadas | Organização e ritmo |
| Containers/formas | Estrutura e agrupamento |
| Glow/blur suave | Profundidade e atmosfera digital |
| Degradê (laranja → laranja claro) | Destaque e dinamismo |

**Patterns:** derivados do "t" estilizado e da perna do "R".

## Identidade verbal

**Tom:** claro e direto · confiante (baseado em lógica) · estratégico · tecnológico · próximo (profissional, mas acessível). Explica, não empurra; orienta, não promete milagres; mostra caminho, não atalhos.

| ✅ Pode falar | ❌ Evitar |
|---|---|
| crescimento, previsibilidade, estrutura, sistema, inteligência, dados, performance, escala, resultado, estratégia, automação, processo, retenção | "lote sua farmácia", "ganhe dinheiro rápido", "resultado garantido", "explosão de vendas", "segredo", "hack", "fórmula mágica", "fature 10x", "imperdível", "sua farmácia está ultrapassada", muitos emojis, jargão técnico excessivo |

Exemplos corretos: *"Estruture sua farmácia para crescer com previsibilidade."* · *"Mais clareza nas decisões. Mais consistência no crescimento."*

A comunicação deve transmitir: **clareza, confiança e inteligência**.

## Direção fotográfica

Ambientes organizados e minimalistas, iluminação suave/natural, saturação equilibrada, estética tecnológica sem exageros futuristas. Temas: farmácias modernas, tecnologia aplicada à operação, pessoas reais em situações naturais, interfaces/dashboards.

## Implicações diretas para o app (Recepta Orbit)

1. Bege `#FFF5D9` como fundo dominante ✅ (já aplicado)
2. Laranja `#D4432C` apenas como destaque/ação — não inundar a tela (20–25%)
3. Verde `#6FAF8F` é a cor "de dado positivo" em dashboards — uso discreto ✅
4. Degradês permitidos somente laranja → laranja claro (`#D4432C → #D97055`)
5. Ícones preenchidos com cantos arredondados (atual: stroke 1.5 — avaliar migração para filled)
6. Microcopy do app segue identidade verbal: direto, sem hype, sem emoji em excesso
7. Logo reduzido prioritário (R+t integrado) como favicon/ícone do app
