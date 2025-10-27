import { BannerFormat } from "./types";
import { Type } from "@google/genai";

export const GEMINI_API_KEY: string = process.env.API_KEY || '';
export const TEXT_GENERATION_MODEL = 'gemini-2.5-flash';
export const IMAGE_GENERATION_MODEL = 'imagen-4.0-generate-001'; // For high-quality logos and banners

export const LOGO_STYLES = ['minimalista', 'geométrico', 'elegante', 'abstrato'];
export const BANNER_FORMAT_LABELS: Record<BannerFormat, string> = {
  '1:1': '1:1 (quadrado) - para posts Instagram/Facebook/LinkedIn',
  '9:16': '9:16 (vertical) - para Stories/TikTok/Reels',
  '4:5': '4:5 (vertical feed) - para feed Instagram/Pinterest',
};

export const DEFAULT_BRAND_NAME = 'Visual Já';
export const DEFAULT_NICHE = 'Design de Branding com IA';
export const DEFAULT_DESCRIPTION = 'Uma plataforma inovadora que permite criar identidade visual e estratégias de marketing completas usando inteligência artificial, sem a necessidade de agências ou profissionais intermediários. Foco em velocidade, personalização e custo-benefício.';

export const EXAMPLE_MEDIA_ANALYSIS_PROMPT = `
Você é um especialista em análise de mídia e branding. Analise a seguinte marca e forneça insights em linguagem popular e acessível:

Nome da Marca: {nome}
Nicho: {nicho}
Descrição: {descricao}

Forneça uma análise completa em formato JSON com:
- resumo: Um resumo geral da marca em 2-3 frases
- publicoAlvo: Descrição do público-alvo ideal
- tonalidadeComunicacao: Tom de voz recomendado para a comunicação
- pontosFortes: Array com 3-5 pontos fortes da marca
- oportunidades: Array com 3-5 oportunidades de mercado

Use linguagem simples e direta, sem jargões técnicos.
`;

export const EXAMPLE_SOCIAL_MEDIA_STRATEGY_PROMPT = `
Você é um especialista em estratégia de mídia social. Com base na seguinte análise de marca:

Nome da Marca: {nome}
Nicho: {nicho}
Descrição: {descricao}
Público-alvo: {publicoAlvo}
Tom de comunicação: {tonalidadeComunicacao}

Gere uma estratégia de mídia social completa em formato JSON com:
- objetivoPrincipal: O principal objetivo da estratégia (1 frase)
- plataformasRecomendadas: Array com 3-5 plataformas sociais recomendadas
- tiposConteudo: Array com 5-7 tipos de conteúdo para produzir em cada plataforma
- frequenciaPostagem: Frequência de postagem recomendada (ex: "3-5 vezes por semana")
- hashtags: Array com 8-12 hashtags relevantes

Use linguagem simples e direta, sem jargões técnicos.
`;

export const EXAMPLE_PAID_TRAFFIC_STRATEGY_PROMPT = `
Você é um especialista em estratégia de tráfego pago. Com base na seguinte análise de marca:

Nome da Marca: {nome}
Nicho: {nicho}
Descrição: {descricao}
Público-alvo: {publicoAlvo}
Tom de comunicação: {tonalidadeComunicacao}

Gere uma estratégia de tráfego pago completa em formato JSON com:
- plataformasAnuncios: Array com 3-4 plataformas de anúncios recomendadas
- orcamentoMensal: Sugestão de orçamento mensal (ex: "R$ 1.000 - R$ 3.000")
- segmentacaoIdeal: Descrição detalhada da segmentação ideal
- tiposAnuncios: Array com 4-6 tipos de anúncios recomendados (ex: "Display", "Vídeo", "Carrossel")
- metricasImportantes: Array com 5-7 métricas importantes para acompanhar (ex: "CPC", "CTR", "ROAS")

Use linguagem simples e direta, sem jargões técnicos.
`;

export const EXAMPLE_SLOGAN_PROMPT = `
Você é um especialista em branding. Crie um slogan impactante e memorável (máximo 8 palavras) para a marca:

Nome da Marca: {nome}
Nicho: {nicho}
Descrição: {descricao}
Tom de comunicação: {tonalidadeComunicacao}

O slogan deve transmitir {tonalidadeComunicacao} e ser facilmente lembrado. Retorne apenas o slogan.
`;

export const EXAMPLE_COLOR_PALETTE_PROMPT = `
Você é um especialista em branding. Gere uma paleta de 4 cores harmonizadas para a marca:

Nome da Marca: {nome}
Nicho: {nicho}
Descrição: {descricao}
Tom de comunicação: {tonalidadeComunicacao}

Retorne um array JSON com 4 strings de códigos hexadecimais (incluindo o '#'). Exemplo: ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"].
`;


export const generateLogoPrompt = (
  brandName: string,
  niche: string,
  style: string,
  colorPalette: string[],
  communicationTone: string,
  referenceImages?: { inlineData: { mimeType: string; data: string } }[]
): string => {
  const colors = colorPalette.map(c => `{${c}}`).join(', ');
  const basePrompt = `Professional ${style} logo design for "${brandName}", a ${niche} brand.
Clean, simple, and modern aesthetic.
Color palette: ${colors}.
High contrast, memorable symbol that represents ${communicationTone} tone.
Suitable for digital and print use.
Pure icon/symbol design, no text.
Flat design, vector style, white background.`;

  // For this simplified frontend, we'll just include a textual reference to images
  // In a real backend, you'd send the actual image parts to Gemini's multi-modal API.
  // The Gemini Image Generation API (imagen-4.0) only takes a prompt string.
  // If we were using gemini-2.5-flash-image, we'd add image parts directly to contents.
  // For imagen-4.0, the prompt has to be descriptive enough.
  return basePrompt;
};

export const generateBannerPrompt = (
  brandName: string,
  niche: string,
  format: BannerFormat,
  colorPalette: string[],
  communicationTone: string,
  referenceImages?: { inlineData: { mimeType: string; data: string } }[]
): string => {
  const colors = colorPalette.map(c => `{${c}}`).join(', ');
  let aspectRatioText = '';
  switch (format) {
    case BannerFormat.SQUARE:
      aspectRatioText = '1:1 aspect ratio for Instagram/Facebook/LinkedIn posts.';
      break;
    case BannerFormat.VERTICAL_STORY:
      aspectRatioText = '9:16 aspect ratio for Instagram/TikTok stories.';
      break;
    case BannerFormat.VERTICAL_FEED:
      aspectRatioText = '4:5 aspect ratio for Instagram/Pinterest feed posts.';
      break;
  }

  const basePrompt = `Professional ${format === BannerFormat.SQUARE ? 'square' : 'vertical'} social media banner for "${brandName}" brand, ${niche} business.
${aspectRatioText}
Dark gradient background with colors: ${colors.split(', ')[0]}, ${colors.split(', ')[1]}.
Bold headline in modern sans-serif font.
Include brand name "${brandName}" prominently.
${communicationTone} aesthetic.
Clean, minimalist layout, strong visual hierarchy, professional and impactful.`;

  return basePrompt;
};

export const continuousGenerationPromptsSchema = {
  type: Type.OBJECT,
  properties: {
    positive: { type: Type.STRING },
    negative: { type: Type.STRING },
  },
  required: ['positive', 'negative'],
};

export const LOGO_CONTINUOUS_PROMPT_GENERATION_PROMPT = `
Você é um especialista em branding e IA para geração de imagens. Dada a análise de marca e o prompt original usado para gerar um logo, crie dois novos prompts para geração contínua:

---
**Análise de Marca:**
Nome da Marca: {nome}
Nicho: {nicho}
Descrição: {descricao}
Slogan: {slogan}
Público-alvo: {publicoAlvo}
Tom de comunicação: {tonalidadeComunicacao}
Pontos Fortes: {pontosFortes}
Oportunidades: {oportunidades}
Paleta de Cores Principais: {colorPalette}
---
**Prompt Original do Logo:** {originalPrompt}
---

Gere um objeto JSON com dois prompts para geração de imagem de logo:
1. Um prompt 'positive': Descreva uma variação de logo que reforce os pontos fortes e oportunidades da marca, mantendo o tom e a estética, ideal para explorar mais opções de sucesso. Foco em um aspecto específico ou uma evolução natural do estilo atual.
2. Um prompt 'negative': Descreva uma variação de logo que a marca **deve evitar**, por ir contra o tom de comunicação, pontos fortes ou público-alvo, ou por ser genérico/datado/inapropriado para o nicho.

Use linguagem clara, concisa e orientada para IA de geração de imagem para os prompts. Os prompts devem ser curtos e focados.

Exemplo de saída:
{
  "positive": "Um logo vibrante e moderno que usa formas geométricas dinâmicas para transmitir inovação e energia no nicho de tecnologia, com cores da paleta, em estilo abstrato.",
  "negative": "Um logo genérico e minimalista demais, sem cores, que parece uma empresa de contabilidade em vez de tecnologia, com tipografia sem personalidade, em estilo serifado antigo."
}
`;

export const BANNER_CONTINUOUS_PROMPT_GENERATION_PROMPT = `
Você é um especialista em marketing digital e IA para geração de imagens. Dada a análise de marca, a estratégia de mídia social e o prompt original usado para gerar um banner, crie dois novos prompts para geração contínua:

---
**Análise de Marca e Estratégia:**
Nome da Marca: {nome}
Nicho: {nicho}
Descrição: {descricao}
Slogan: {slogan}
Público-alvo: {publicoAlvo}
Tom de comunicação: {tonalidadeComunicacao}
Pontos Fortes: {pontosFortes}
Oportunidades: {oportunidades}
Paleta de Cores Principais: {colorPalette}
Objetivo Principal da Estratégia de Mídia Social: {objetivoPrincipalSocial}
Plataformas Sociais Recomendadas: {plataformasRecomendadas}
---
**Prompt Original do Banner ({formato}):** {originalPrompt}
---

Gere um objeto JSON com dois prompts para geração de imagem de banner:
1. Um prompt 'positive': Descreva uma variação de banner que reforce o objetivo principal da estratégia de mídia social, usando o tom e a estética da marca. Foco em uma nova abordagem visual ou mensagem poderosa para a plataforma específica.
2. Um prompt 'negative': Descreva uma variação de banner que a marca **deve evitar**, por não se alinhar com a estratégia de mídia social, o tom de comunicação, o público-alvo ou ser visualmente ineficaz/confuso para o formato.

Use linguagem clara, concisa e orientada para IA de geração de imagem para os prompts. Os prompts devem ser curtos e focados.

Exemplo de saída:
{
  "positive": "Um banner vertical 9:16 para Instagram Stories, com fundo gradiente, tipografia moderna e imagem impactante que celebra a autonomia criativa, usando as cores principais.",
  "negative": "Um banner 1:1 quadrado para Facebook com muitos elementos, texto ilegível, cores desarmoniosas e uma imagem clichê de aperto de mãos, estilo antiquado."
}
`;
