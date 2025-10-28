

import {
  BrandingProject,
  ProjectStatus,
  Reference,
  Logo,
  Banner,
  MediaAnalysis,
  SocialMediaStrategy,
  PaidTrafficStrategy,
  BannerFormat,
  ContinuousGenerationPrompts,
} from '../types';
import {
  TEXT_GENERATION_MODEL,
  IMAGE_GENERATION_MODEL,
  EXAMPLE_MEDIA_ANALYSIS_PROMPT,
  EXAMPLE_SOCIAL_MEDIA_STRATEGY_PROMPT,
  EXAMPLE_PAID_TRAFFIC_STRATEGY_PROMPT,
  EXAMPLE_SLOGAN_PROMPT,
  EXAMPLE_COLOR_PALETTE_PROMPT,
  generateLogoPrompt,
  generateBannerPrompt,
  LOGO_STYLES,
  LOGO_CONTINUOUS_PROMPT_GENERATION_PROMPT,
  BANNER_CONTINUOUS_PROMPT_GENERATION_PROMPT,
  // Fix: Import continuousGenerationPromptsSchema from constants.ts
  continuousGenerationPromptsSchema,
} from '../constants';
import {
  generateText,
  generateImage,
  mediaAnalysisSchema,
  socialMediaStrategySchema,
  paidTrafficStrategySchema,
  colorPaletteSchema,
  fileToBase64,
} from './geminiService';

// --- In-memory database (simulated with localStorage) ---
const STORAGE_KEY = 'visual-ja-projects';
let projects: BrandingProject[] = [];

try {
  const storedProjects = localStorage.getItem(STORAGE_KEY);
  if (storedProjects) {
    projects = JSON.parse(storedProjects);
  }
} catch (e) {
  console.error("Failed to load projects from localStorage", e);
  projects = [];
}

const saveProjectsToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects to localStorage", e);
  }
};


// --- Helper Functions ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// --- Project API (Simulated) ---

export const createProject = async (
  name: string,
  niche: string,
  description?: string,
  files?: File[],
): Promise<BrandingProject> => {
  await delay(500); // Simulate API call latency

  const newProject: BrandingProject = {
    id: generateUniqueId(),
    name,
    niche,
    description,
    status: ProjectStatus.PROCESSING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    references: [],
  };

  if (files && files.length > 0) {
    const referencePromises = files.map(async (file) => {
      const base64Data = await fileToBase64(file);
      return {
        id: generateUniqueId(),
        projectId: newProject.id,
        url: URL.createObjectURL(file), // For frontend preview, not actual S3 URL
        fileKey: `references/${newProject.id}/${file.name}`,
        filename: file.name,
        mimeType: file.type,
        created_at: new Date().toISOString(),
        base64Data: base64Data, // Store base64 for Gemini input
      } as Reference;
    });
    newProject.references = await Promise.all(referencePromises);
  }

  projects.push(newProject);
  saveProjectsToStorage();
  // Start background processing immediately after creation
  processProjectInBackground(newProject.id);
  return newProject;
};

export const getProject = async (projectId: string): Promise<BrandingProject | undefined> => {
  await delay(300); // Simulate API call latency
  return projects.find(p => p.id === projectId);
};

export const getProjects = async (): Promise<BrandingProject[]> => {
  await delay(100);
  // Return a copy sorted by most recent
  return [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await delay(300);
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex > -1) {
    projects.splice(projectIndex, 1);
    saveProjectsToStorage();
  }
};


// --- Background Processing (Simulated) ---

const processProjectInBackground = async (projectId: string) => {
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return;

  const project = projects[projectIndex];
  console.log(`[Backend Sim] Starting processing for project: ${project.id}`);

  try {
    // Helper to update project and simulate UI update
    const updateProject = (updates: Partial<BrandingProject>) => {
      Object.assign(project, updates);
      project.updatedAt = new Date().toISOString();
      saveProjectsToStorage();
      // In a real app, this would trigger a database save and potentially a websocket update.
      // For simulation, we just modify the in-memory object.
    };

    // 1. Generate Media Analysis
    await delay(3000);
    console.log(`[Backend Sim] Generating Media Analysis for ${project.id}`);
    const mediaAnalysisPrompt = EXAMPLE_MEDIA_ANALYSIS_PROMPT
      .replace('{nome}', project.name)
      .replace('{nicho}', project.niche)
      .replace('{descricao}', project.description || '');

    const mediaAnalysis = await generateText<MediaAnalysis>(
      {
        model: TEXT_GENERATION_MODEL,
        contents: mediaAnalysisPrompt,
      },
      mediaAnalysisSchema
    );
    updateProject({ mediaAnalysis });

    // 2. Generate Slogan
    await delay(1500);
    console.log(`[Backend Sim] Generating Slogan for ${project.id}`);
    const sloganPrompt = EXAMPLE_SLOGAN_PROMPT
      .replace('{nome}', project.name)
      .replace('{nicho}', project.niche)
      .replace('{descricao}', project.description || '')
      .replace('{tonalidadeComunicacao}', mediaAnalysis.tonalidadeComunicacao);

    const slogan = await generateText<string>({
      model: TEXT_GENERATION_MODEL,
      contents: sloganPrompt,
    });
    updateProject({ slogan: slogan.replace(/"/g, '').trim() }); // Clean up potential quotes

    // 3. Generate Color Palette
    await delay(2000);
    console.log(`[Backend Sim] Generating Color Palette for ${project.id}`);
    const colorPalettePrompt = EXAMPLE_COLOR_PALETTE_PROMPT
      .replace('{nome}', project.name)
      .replace('{nicho}', project.niche)
      .replace('{descricao}', project.description || '')
      .replace('{tonalidadeComunicacao}', mediaAnalysis.tonalidadeComunicacao);

    const colorPalette = await generateText<string[]>(
      {
        model: TEXT_GENERATION_MODEL,
        contents: colorPalettePrompt,
      },
      colorPaletteSchema
    );
    updateProject({ colorPalette });

    // 4. Generate Social Media Strategy
    await delay(3000);
    console.log(`[Backend Sim] Generating Social Media Strategy for ${project.id}`);
    const socialMediaStrategyPrompt = EXAMPLE_SOCIAL_MEDIA_STRATEGY_PROMPT
      .replace('{nome}', project.name)
      .replace('{nicho}', project.niche)
      .replace('{descricao}', project.description || '')
      .replace('{publicoAlvo}', mediaAnalysis.publicoAlvo)
      .replace('{tonalidadeComunicacao}', mediaAnalysis.tonalidadeComunicacao);

    const socialMediaStrategy = await generateText<SocialMediaStrategy>(
      {
        model: TEXT_GENERATION_MODEL,
        contents: socialMediaStrategyPrompt,
      },
      socialMediaStrategySchema
    );
    updateProject({ socialMediaStrategy });

    // 5. Generate Paid Traffic Strategy
    await delay(3000);
    console.log(`[Backend Sim] Generating Paid Traffic Strategy for ${project.id}`);
    const paidTrafficStrategyPrompt = EXAMPLE_PAID_TRAFFIC_STRATEGY_PROMPT
      .replace('{nome}', project.name)
      .replace('{nicho}', project.niche)
      .replace('{descricao}', project.description || '')
      .replace('{publicoAlvo}', mediaAnalysis.publicoAlvo)
      .replace('{tonalidadeComunicacao}', mediaAnalysis.tonalidadeComunicacao);

    const paidTrafficStrategy = await generateText<PaidTrafficStrategy>(
      {
        model: TEXT_GENERATION_MODEL,
        contents: paidTrafficStrategyPrompt,
      },
      paidTrafficStrategySchema
    );
    updateProject({ paidTrafficStrategy });

    // Ensure colorPalette is available for image generation
    if (!project.colorPalette || project.colorPalette.length === 0) {
      throw new Error('Color palette not generated, cannot proceed with image generation.');
    }
    const colorsForImages = project.colorPalette.length >= 4 ?
      project.colorPalette.slice(0, 4) :
      ['#00C6FF', '#0A0F1C', '#F5F7FA', '#9292FF']; // Fallback colors

    // 6. Generate 4 Logos (sequential)
    const generatedLogos: Logo[] = [];
    for (let i = 0; i < LOGO_STYLES.length; i++) {
      await delay(5000 + Math.random() * 2000); // Simulate longer image generation
      console.log(`[Backend Sim] Generating Logo ${i + 1} (${LOGO_STYLES[i]}) for ${project.id}`);
      const logoPrompt = generateLogoPrompt(
        project.name,
        project.niche,
        LOGO_STYLES[i],
        colorsForImages,
        mediaAnalysis.tonalidadeComunicacao,
        project.references?.map(ref => ({
          inlineData: { mimeType: ref.mimeType, data: ref.base64Data! }
        }))
      );
      const imageUrl = await generateImage({
        model: IMAGE_GENERATION_MODEL,
        prompt: logoPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
      });

      // Generate continuous generation prompts for logo
      const logoContinuousPromptInput = LOGO_CONTINUOUS_PROMPT_GENERATION_PROMPT
        .replace('{nome}', project.name)
        .replace('{nicho}', project.niche)
        .replace('{descricao}', project.description || '')
        .replace('{slogan}', project.slogan || 'N/A')
        .replace('{publicoAlvo}', mediaAnalysis.publicoAlvo)
        .replace('{tonalidadeComunicacao}', mediaAnalysis.tonalidadeComunicacao)
        .replace('{pontosFortes}', mediaAnalysis.pontosFortes.slice(0, 3).join(', '))
        .replace('{oportunidades}', mediaAnalysis.oportunidades.slice(0, 3).join(', '))
        .replace('{colorPalette}', colorsForImages.slice(0,2).join(', ')) // Use fewer colors for prompt context
        .replace('{originalPrompt}', logoPrompt);

      const continuousLogoPrompts = await generateText<ContinuousGenerationPrompts>(
        {
          model: TEXT_GENERATION_MODEL,
          contents: logoContinuousPromptInput,
        },
        continuousGenerationPromptsSchema
      );

      generatedLogos.push({
        id: generateUniqueId(),
        projectId: project.id,
        variacao: i + 1,
        url: imageUrl,
        fileKey: `logos/${project.id}/logo_variacao_${i + 1}.png`,
        prompt: logoPrompt,
        positivePrompt: continuousLogoPrompts.positive,
        negativePrompt: continuousLogoPrompts.negative,
      });
      updateProject({ logos: [...generatedLogos] });
    }

    // 7. Generate 3 Banners (sequential)
    const bannerFormats = [BannerFormat.SQUARE, BannerFormat.VERTICAL_STORY, BannerFormat.VERTICAL_FEED];
    const generatedBanners: Banner[] = [];
    for (const format of bannerFormats) {
      await delay(7000 + Math.random() * 3000); // Simulate longer image generation
      console.log(`[Backend Sim] Generating Banner (${format}) for ${project.id}`);
      
      const headline = project.mediaAnalysis?.pontosFortes?.[0] || project.socialMediaStrategy?.objetivoPrincipal || `${project.name}: Inovação e Design`;
      const textContent = {
        slogan: project.slogan,
        headline: headline,
      };

      const bannerPrompt = generateBannerPrompt(
        project.name,
        project.niche,
        format,
        colorsForImages,
        mediaAnalysis.tonalidadeComunicacao,
        textContent,
        project.references?.map(ref => ({
          inlineData: { mimeType: ref.mimeType, data: ref.base64Data! }
        }))
      );
      let aspectRatio: '1:1' | '9:16' | '4:3' | '3:4' | '16:9' = '1:1'; // Default
      switch (format) {
        case BannerFormat.SQUARE:
          aspectRatio = '1:1';
          break;
        case BannerFormat.VERTICAL_STORY:
          aspectRatio = '9:16';
          break;
        case BannerFormat.VERTICAL_FEED:
          aspectRatio = '3:4'; // Imagen supports 3:4 for vertical, not directly 4:5
          break;
      }

      const imageUrl = await generateImage({
        model: IMAGE_GENERATION_MODEL,
        prompt: bannerPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
      });

      // Generate continuous generation prompts for banner
      const bannerContinuousPromptInput = BANNER_CONTINUOUS_PROMPT_GENERATION_PROMPT
        .replace('{nome}', project.name)
        .replace('{nicho}', project.niche)
        .replace('{descricao}', project.description || '')
        .replace('{slogan}', project.slogan || 'N/A')
        .replace('{publicoAlvo}', mediaAnalysis.publicoAlvo)
        .replace('{tonalidadeComunicacao}', mediaAnalysis.tonalidadeComunicacao)
        .replace('{pontosFortes}', mediaAnalysis.pontosFortes.slice(0, 3).join(', '))
        .replace('{oportunidades}', mediaAnalysis.oportunidades.slice(0, 3).join(', '))
        .replace('{colorPalette}', colorsForImages.slice(0,2).join(', '))
        .replace('{objetivoPrincipalSocial}', socialMediaStrategy?.objetivoPrincipal || 'N/A')
        .replace('{plataformasRecomendadas}', socialMediaStrategy?.plataformasRecomendadas.slice(0, 2).join(', ') || 'N/A')
        .replace('{formato}', format)
        .replace('{originalPrompt}', bannerPrompt);

      const continuousBannerPrompts = await generateText<ContinuousGenerationPrompts>(
        {
          model: TEXT_GENERATION_MODEL,
          contents: bannerContinuousPromptInput,
        },
        continuousGenerationPromptsSchema
      );

      generatedBanners.push({
        id: generateUniqueId(),
        projectId: project.id,
        formato: format,
        url: imageUrl,
        fileKey: `banners/${project.id}/banner_${format.replace(':', 'x')}.png`,
        prompt: bannerPrompt,
        positivePrompt: continuousBannerPrompts.positive,
        negativePrompt: continuousBannerPrompts.negative,
      });
      updateProject({ banners: [...generatedBanners] });
    }

    // 8. Finalize project
    updateProject({ status: ProjectStatus.COMPLETED });
    console.log(`[Backend Sim] Project ${project.id} completed!`);

  } catch (error: any) {
    console.error(`[Backend Sim] Error processing project ${projectId}:`, error);
    // In a real app, you'd log the error and possibly notify an admin.
    // For this simulation, we mark it as failed and store the error message.
    project.status = ProjectStatus.FAILED;
    project.updatedAt = new Date().toISOString();
    saveProjectsToStorage();
    // Potentially add an errorMessage field to BrandingProject
    console.log(`[Backend Sim] Project ${projectId} failed.`);
  }
};

export const regenerateLogo = async (projectId: string, logoToReplace: Logo): Promise<Logo> => {
  await delay(7000 + Math.random() * 3000); // Simulate longer image generation

  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) throw new Error('Projeto não encontrado para regenerar logo.');
  const project = projects[projectIndex];

  if (!project.mediaAnalysis || !project.colorPalette || project.colorPalette.length === 0) {
    throw new Error('Dados do projeto incompletos para regenerar logo.');
  }

  const colorsForImages = project.colorPalette.length >= 4 ?
    project.colorPalette.slice(0, 4) :
    ['#00C6FF', '#0A0F1C', '#F5F7FA', '#9292FF']; // Fallback colors

  // Use the positive prompt for regeneration, if available, otherwise fallback to original
  const regenerationPrompt = logoToReplace.positivePrompt || logoToReplace.prompt;

  console.log(`[Backend Sim] Regenerating Logo (Variacao ${logoToReplace.variacao}) for ${projectId}`);
  const imageUrl = await generateImage({
    model: IMAGE_GENERATION_MODEL,
    prompt: regenerationPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '1:1',
    },
  });

  // Re-generate continuous generation prompts for the new logo to allow further iterations
  const logoContinuousPromptInput = LOGO_CONTINUOUS_PROMPT_GENERATION_PROMPT
    .replace('{nome}', project.name)
    .replace('{nicho}', project.niche)
    .replace('{descricao}', project.description || '')
    .replace('{slogan}', project.slogan || 'N/A')
    .replace('{publicoAlvo}', project.mediaAnalysis.publicoAlvo)
    .replace('{tonalidadeComunicacao}', project.mediaAnalysis.tonalidadeComunicacao)
    .replace('{pontosFortes}', project.mediaAnalysis.pontosFortes.slice(0, 3).join(', '))
    .replace('{oportunidades}', project.mediaAnalysis.oportunidades.slice(0, 3).join(', '))
    .replace('{colorPalette}', colorsForImages.slice(0, 2).join(', '))
    .replace('{originalPrompt}', regenerationPrompt);

  const newContinuousPrompts = await generateText<ContinuousGenerationPrompts>(
    {
      model: TEXT_GENERATION_MODEL,
      contents: logoContinuousPromptInput,
    },
    continuousGenerationPromptsSchema
  );

  const newLogo: Logo = {
    ...logoToReplace,
    id: generateUniqueId(), // New ID for the new image instance
    url: imageUrl,
    prompt: regenerationPrompt, // Store the prompt used for this generation
    positivePrompt: newContinuousPrompts.positive,
    negativePrompt: newContinuousPrompts.negative,
  };

  project.logos = project.logos?.map(logo => logo.id === logoToReplace.id ? newLogo : logo);
  project.updatedAt = new Date().toISOString();
  saveProjectsToStorage();

  return newLogo;
};


export const regenerateBanner = async (projectId: string, bannerToReplace: Banner): Promise<Banner> => {
  await delay(7000 + Math.random() * 3000); // Simulate longer image generation

  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) throw new Error('Projeto não encontrado para regenerar banner.');
  const project = projects[projectIndex];

  if (!project.mediaAnalysis || !project.socialMediaStrategy || !project.colorPalette || project.colorPalette.length === 0) {
    throw new Error('Dados do projeto incompletos para regenerar banner.');
  }

  const colorsForImages = project.colorPalette.length >= 4 ?
    project.colorPalette.slice(0, 4) :
    ['#00C6FF', '#0A0F1C', '#F5F7FA', '#9292FF']; // Fallback colors

  // Use the positive prompt for regeneration, if available, otherwise fallback to original
  const regenerationPrompt = bannerToReplace.positivePrompt || bannerToReplace.prompt;

  let aspectRatio: '1:1' | '9:16' | '4:3' | '3:4' | '16:9' = '1:1'; // Default
  switch (bannerToReplace.formato) {
    case BannerFormat.SQUARE:
      aspectRatio = '1:1';
      break;
    case BannerFormat.VERTICAL_STORY:
      aspectRatio = '9:16';
      break;
    case BannerFormat.VERTICAL_FEED:
      aspectRatio = '3:4'; // Imagen supports 3:4 for vertical, not directly 4:5
      break;
  }

  console.log(`[Backend Sim] Regenerating Banner (${bannerToReplace.formato}) for ${projectId}`);
  const imageUrl = await generateImage({
    model: IMAGE_GENERATION_MODEL,
    prompt: regenerationPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: aspectRatio,
    },
  });

  // Re-generate continuous generation prompts for the new banner
  const bannerContinuousPromptInput = BANNER_CONTINUOUS_PROMPT_GENERATION_PROMPT
    .replace('{nome}', project.name)
    .replace('{nicho}', project.niche)
    .replace('{descricao}', project.description || '')
    .replace('{slogan}', project.slogan || 'N/A')
    .replace('{publicoAlvo}', project.mediaAnalysis.publicoAlvo)
    .replace('{tonalidadeComunicacao}', project.mediaAnalysis.tonalidadeComunicacao)
    .replace('{pontosFortes}', project.mediaAnalysis.pontosFortes.slice(0, 3).join(', '))
    .replace('{oportunidades}', project.mediaAnalysis.oportunidades.slice(0, 3).join(', '))
    .replace('{colorPalette}', colorsForImages.slice(0, 2).join(', '))
    .replace('{objetivoPrincipalSocial}', project.socialMediaStrategy.objetivoPrincipal || 'N/A')
    .replace('{plataformasRecomendadas}', project.socialMediaStrategy.plataformasRecomendadas.slice(0, 2).join(', ') || 'N/A')
    .replace('{formato}', bannerToReplace.formato)
    .replace('{originalPrompt}', regenerationPrompt);

  const newContinuousPrompts = await generateText<ContinuousGenerationPrompts>(
    {
      model: TEXT_GENERATION_MODEL,
      contents: bannerContinuousPromptInput,
    },
    continuousGenerationPromptsSchema
  );

  const newBanner: Banner = {
    ...bannerToReplace,
    id: generateUniqueId(), // New ID for the new image instance
    url: imageUrl,
    prompt: regenerationPrompt, // Store the prompt used for this generation
    positivePrompt: newContinuousPrompts.positive,
    negativePrompt: newContinuousPrompts.negative,
  };

  project.banners = project.banners?.map(banner => banner.id === bannerToReplace.id ? newBanner : banner);
  project.updatedAt = new Date().toISOString();
  saveProjectsToStorage();

  return newBanner;
};