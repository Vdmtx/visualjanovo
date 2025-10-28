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
Pense como um especialista em marcas de sucesso. Olhe para esta marca:

Marca: {nome}
Atuação: {nicho}
O que faz: {descricao}

Agora, me dê um raio-x dela, em formato JSON, de um jeito fácil de entender:
- resumo: A marca em duas frases.
- publicoAlvo: Para quem essa marca vende? (Descreva a pessoa ideal).
- tonalidadeComunicacao: Como a marca deve falar? (Ex: Amigável, séria, divertida?).
- pontosFortes: O que essa marca tem de muito bom? (Liste 3 a 5 coisas).
- oportunidades: O que a marca pode aproveitar para crescer? (Liste 3 a 5 ideias).

Seja super direto e simples, como se estivesse explicando para um amigo.
`;

export const EXAMPLE_SOCIAL_MEDIA_STRATEGY_PROMPT = `
Pense como um guru das redes sociais. Com base nestas informações da marca:

Marca: {nome}
Atuação: {nicho}
O que faz: {descricao}
Para quem vende: {publicoAlvo}
Como fala: {tonalidadeComunicacao}

Crie um plano de ação para as redes sociais dela, em formato JSON, bem mastigado:
- objetivoPrincipal: O que queremos alcançar com as redes sociais? (Em uma frase).
- plataformasRecomendadas: Onde a marca deve estar? (Liste de 3 a 5 redes sociais).
- tiposConteudo: O que postar? (Dê de 5 a 7 ideias de posts).
- frequenciaPostagem: Quantas vezes postar? (Ex: "3 posts por semana").
- hashtags: Quais # usar? (Liste de 8 a 12 hashtags boas).

Use palavras simples. Imagine que está dando dicas para alguém que nunca mexeu com marketing.
`;

export const EXAMPLE_PAID_TRAFFIC_STRATEGY_PROMPT = `
Pense como um especialista em anúncios online que manja muito. Com base nestas informações da marca:

Marca: {nome}
Atuação: {nicho}
O que faz: {descricao}
Para quem vende: {publicoAlvo}
Como fala: {tonalidadeComunicacao}

Crie um plano para anunciar na internet, em formato JSON, de forma que qualquer um entenda:
- plataformasAnuncios: Onde anunciar? (Liste 3 a 4 lugares, como Instagram, Google, etc.).
- orcamentoMensal: Quanto investir por mês? (Dê uma sugestão, ex: "de R$ 500 a R$ 1.500").
- segmentacaoIdeal: Para quem mostrar os anúncios? (Descreva o público em detalhes).
- tiposAnuncios: Que tipo de anúncio fazer? (Dê 4 a 6 ideias, ex: "Foto bonita", "Vídeo curto", "Anúncio que aparece no story").
- metricasImportantes: Como saber se está dando certo? (Liste 5 a 7 coisas para ficar de olho, e explique o que cada uma significa de forma simples, sem siglas como CPC ou CTR).

Seja muito claro e direto. Zero complicação.
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
  const colors = colorPalette.map(c => `${c}`).join(', ');
  let aspectRatioText = '';
  let formatDescription = '';
  switch (format) {
    case BannerFormat.SQUARE:
      aspectRatioText = '1:1 aspect ratio';
      formatDescription = 'square';
      break;
    case BannerFormat.VERTICAL_STORY:
      aspectRatioText = '9:16 aspect ratio';
      formatDescription = 'vertical';
      break;
    case BannerFormat.VERTICAL_FEED:
      aspectRatioText = '4:5 aspect ratio';
      formatDescription = 'vertical';
      break;
  }

  // New, more descriptive prompt to avoid mockups
  const basePrompt = `Create a professional and visually striking ${formatDescription} social media banner for the brand "${brandName}", which is in the ${niche} sector.
The banner must have a ${aspectRatioText}.
It must feature a dynamic and clean layout with a dark gradient background using the colors: ${colors}.
The design should incorporate abstract geometric shapes and subtle light effects to convey a sense of innovation and technology.
The brand name "${brandName}" must be prominently displayed in a modern, bold sans-serif font.
Also include a placeholder headline text.
The overall aesthetic should be ${communicationTone}, professional, and impactful.
**Important: Do NOT include any phone mockups, device frames, or screenshots. The design must be a standalone graphic banner suitable for social media advertising.**
Optionally, include a high-quality, professional photo of a person who represents the target audience, seamlessly integrated into the design.`;

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
2. Um prompt 'negative': Descreva uma variação de banner que a marca **deve evitar**, por não se alinhar com a estratégia de mídia social, o tom de comunicação, o público-alvo ou ser visualmente ineficaz/confuso para o formato (ex: incluir um mockup de celular).

Use linguagem clara, concisa e orientada para IA de geração de imagem para os prompts. Os prompts devem ser curtos e focados.

Exemplo de saída:
{
  "positive": "Um banner vertical 9:16 para Instagram Stories, com fundo gradiente, tipografia moderna e uma imagem impactante de uma pessoa focada, celebrando a autonomia criativa, usando as cores principais.",
  "negative": "Um banner 1:1 quadrado para Facebook que usa um mockup de celular, com muitos elementos, texto ilegível e cores desarmoniosas, estilo antiquado."
}
`;