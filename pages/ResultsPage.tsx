

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, regenerateLogo, regenerateBanner } from '../services/apiService'; // Importar as novas funções
import {
  BrandingProject,
  ProjectStatus,
  MediaAnalysis,
  SocialMediaStrategy,
  PaidTrafficStrategy,
  Logo,
  Banner,
  BannerFormat,
} from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast, ToastType } from '../components/ui/Toast';
import { BANNER_FORMAT_LABELS } from '../constants';
import { ImageModal } from '../components/ui/ImageModal';
import JSZip from 'jszip';

// Helper component for rendering strategy/analysis lists
const StrategyList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="mb-4">
    <h4 className="text-lg font-semibold text-primary-cyan mb-2">{title}</h4>
    <ul className="list-disc list-inside text-gray-300">
      {items.map((item, i) => (
        <li key={i} className="mb-1">{item}</li>
      ))}
    </ul>
  </div>
);

// Helper component for loading skeletons
const ContentSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-1/2" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-40" />
    <Skeleton className="h-40" />
    <Skeleton className="h-40" />
  </div>
);

export const ResultsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [project, setProject] = React.useState<BrandingProject | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [downloading, setDownloading] = React.useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null);
  const [regeneratingLogoId, setRegeneratingLogoId] = React.useState<string | null>(null); // Novo estado para carregamento de logo individual
  const [regeneratingBannerId, setRegeneratingBannerId] = React.useState<string | null>(null); // Novo estado para carregamento de banner individual


  // Poll for project status
  React.useEffect(() => {
    if (!projectId) {
      navigate('/criar'); // Redirect if no project ID
      return;
    }

    const fetchProject = async () => {
      try {
        const fetchedProject = await getProject(projectId);
        if (fetchedProject) {
          setProject(fetchedProject);
          if (fetchedProject.status === ProjectStatus.COMPLETED || fetchedProject.status === ProjectStatus.FAILED) {
            setLoading(false);
          }
        } else {
          addToast('Projeto não encontrado.', ToastType.ERROR);
          navigate('/criar');
        }
      } catch (error: any) {
        addToast(`Erro ao carregar projeto: ${error.message}`, ToastType.ERROR);
        setLoading(false);
      }
    };

    let intervalId: number;
    if (loading) {
      fetchProject(); // Initial fetch
      intervalId = setInterval(fetchProject, 3000); // Poll every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [projectId, loading, navigate, addToast]);

  const handleRegenerateLogo = async (logoToRegenerate: Logo) => {
    if (!project) return;
    setRegeneratingLogoId(logoToRegenerate.id);
    addToast(`Gerando nova variação de logo...`, ToastType.INFO);
    try {
      const newLogo = await regenerateLogo(project.id, logoToRegenerate);
      setProject(prevProject => {
        if (!prevProject) return prevProject;
        return {
          ...prevProject,
          logos: prevProject.logos?.map(logo =>
            logo.id === logoToRegenerate.id ? newLogo : logo
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      addToast(`Nova logo gerada com sucesso!`, ToastType.SUCCESS);
    } catch (error: any) {
      addToast(`Erro ao regenerar logo: ${error.message}`, ToastType.ERROR);
      console.error('Regenerate Logo error:', error);
    } finally {
      setRegeneratingLogoId(null);
    }
  };

  const handleRegenerateBanner = async (bannerToRegenerate: Banner) => {
    if (!project) return;
    setRegeneratingBannerId(bannerToRegenerate.id);
    addToast(`Gerando novo banner (${BANNER_FORMAT_LABELS[bannerToRegenerate.formato]})...`, ToastType.INFO);
    try {
      const newBanner = await regenerateBanner(project.id, bannerToRegenerate);
      setProject(prevProject => {
        if (!prevProject) return prevProject;
        return {
          ...prevProject,
          banners: prevProject.banners?.map(banner =>
            banner.id === bannerToRegenerate.id ? newBanner : banner
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      addToast(`Novo banner gerado com sucesso!`, ToastType.SUCCESS);
    } catch (error: any) {
      addToast(`Erro ao regenerar banner: ${error.message}`, ToastType.ERROR);
      console.error('Regenerate Banner error:', error);
    } finally {
      setRegeneratingBannerId(null);
    }
  };


  const handleDownloadZip = async () => {
    if (!project || project.status !== ProjectStatus.COMPLETED) {
      addToast('O projeto ainda não está completo ou falhou para download.', ToastType.ERROR);
      return;
    }

    setDownloading(true);
    addToast('Gerando pacote ZIP...', ToastType.INFO);

    try {
      const zip = new JSZip();
      const folderName = `${project.name.replace(/\s/g, '_')}_branding_completo`;

      // README.md
      zip.file(`${folderName}/README.md`, `
# Projeto de Branding "${project.name}"

Este pacote contém todos os ativos de branding gerados por Visual Já.

## Informações do Projeto
- **Nome da Marca:** ${project.name}
- **Nicho:** ${project.niche}
- **Descrição:** ${project.description || 'N/A'}
- **Slogan:** "${project.slogan || 'N/A'}"

## Conteúdo do Pacote

### Logos
Localizadas na pasta \`logos/\`. Inclui 4 variações de logo em alta resolução (PNG).
*Nota: A IA gera logos em formato PNG. O formato SVG não é suportado no momento pela API.*

### Banners
Localizados na pasta \`banners/\`. Inclui 3 banners em formatos padrão para redes sociais (PNG).

### Análise e Estratégia
- \`ANALISE_E_ESTRATEGIA.md\`: Análise de Mídia, Estratégia de Mídia Social e Estratégia de Tráfego Pago.
- \`PALETA_DE_CORES.md\`: Detalhes da paleta de cores gerada.

## Como Usar
Use estes ativos para iniciar ou revitalizar a presença online da sua marca. As análises e estratégias fornecem um guia para a sua comunicação e marketing.
`);

      // ANALISE_E_ESTRATEGIA.md
      let analysisContent = `# Análise e Estratégia para "${project.name}"\n\n`;

      if (project.mediaAnalysis) {
        analysisContent += `## Análise de Mídia\n\n`;
        analysisContent += `**Resumo Geral:** ${project.mediaAnalysis.resumo}\n\n`;
        analysisContent += `**Público-alvo Ideal:** ${project.mediaAnalysis.publicoAlvo}\n\n`;
        analysisContent += `**Tom de Comunicação Recomendado:** ${project.mediaAnalysis.tonalidadeComunicacao}\n\n`;
        analysisContent += `**Pontos Fortes da Marca:**\n`;
        project.mediaAnalysis.pontosFortes.forEach(p => analysisContent += `- ${p}\n`);
        analysisContent += `\n**Oportunidades de Mercado:**\n`;
        project.mediaAnalysis.oportunidades.forEach(o => analysisContent += `- ${o}\n`);
        analysisContent += `\n---\n\n`;
      }

      if (project.socialMediaStrategy) {
        analysisContent += `## Estratégia de Mídia Social\n\n`;
        analysisContent += `**Objetivo Principal:** ${project.socialMediaStrategy.objetivoPrincipal}\n\n`;
        analysisContent += `**Plataformas Recomendadas:** ${project.socialMediaStrategy.plataformasRecomendadas.join(', ')}\n\n`;
        analysisContent += `**Tipos de Conteúdo para Produzir:**\n`;
        project.socialMediaStrategy.tiposConteudo.forEach(tc => analysisContent += `- ${tc}\n`);
        analysisContent += `\n**Frequência de Postagem Recomendada:** ${project.socialMediaStrategy.frequenciaPostagem}\n\n`;
        analysisContent += `**Hashtags Relevantes:** ${project.socialMediaStrategy.hashtags.join(', ')}\n\n`;
        analysisContent += `\n---\n\n`;
      }

      if (project.paidTrafficStrategy) {
        analysisContent += `## Estratégia de Tráfego Pago\n\n`;
        analysisContent += `**Plataformas de Anúncios Recomendadas:** ${project.paidTrafficStrategy.plataformasAnuncios.join(', ')}\n\n`;
        analysisContent += `**Orçamento Mensal Sugerido:** ${project.paidTrafficStrategy.orcamentoMensal}\n\n`;
        analysisContent += `**Descrição da Segmentação Ideal:** ${project.paidTrafficStrategy.segmentacaoIdeal}\n\n`;
        analysisContent += `**Tipos de Anúncios Recomendados:** ${project.paidTrafficStrategy.tiposAnuncios.join(', ')}\n\n`;
        analysisContent += `**Métricas Importantes para Acompanhar:** ${project.paidTrafficStrategy.metricasImportantes.join(', ')}\n\n`;
        analysisContent += `\n---\n\n`;
      }
      zip.file(`${folderName}/ANALISE_E_ESTRATEGIA.md`, analysisContent);

      // PALETA_DE_CORES.md
      if (project.colorPalette && project.colorPalette.length > 0) {
        let colorPaletteContent = `# Paleta de Cores para "${project.name}"\n\n`;
        colorPaletteContent += `Aqui está a paleta de cores harmonizadas gerada para sua marca:\n\n`;
        project.colorPalette.forEach(hex => {
          colorPaletteContent += `- ${hex}\n`;
        });
        zip.file(`${folderName}/PALETA_DE_CORES.md`, colorPaletteContent);
      }

      // Logos
      const logoFolder = zip.folder(`${folderName}/logos`);
      if (project.logos) {
        for (const logo of project.logos) {
          const response = await fetch(logo.url);
          const blob = await response.blob();
          logoFolder?.file(`logo_variacao_${logo.variacao}.png`, blob);
        }
      }

      // Banners
      const bannerFolder = zip.folder(`${folderName}/banners`);
      if (project.banners) {
        for (const banner of project.banners) {
          const response = await fetch(banner.url);
          const blob = await response.blob();
          bannerFolder?.file(`banner_${banner.formato.replace(':', 'x')}.png`, blob);
        }
      }

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Pacote ZIP gerado e download iniciado!', ToastType.SUCCESS);
    } catch (error: any) {
      addToast(`Falha ao gerar o pacote ZIP: ${error.message}`, ToastType.ERROR);
      console.error('Download ZIP error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const renderStatusMessage = () => {
    if (project?.status === ProjectStatus.PROCESSING) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-light-text mb-8">
          <Spinner size="lg" className="mb-4" />
          <h2 className="text-2xl font-montserrat font-bold mb-2">Gerando seu branding completo...</h2>
          <p className="text-xl text-primary-cyan">Eliminando intermediários...</p>
          <p className="mt-4 text-gray-400 text-sm">Isso pode levar alguns minutos. Por favor, não feche esta página.</p>
        </div>
      );
    }
    if (project?.status === ProjectStatus.FAILED) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-light-text mb-8">
          <svg className="h-20 w-20 text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
          <h2 className="text-2xl font-montserrat font-bold mb-2 text-red-500">Falha na Geração do Branding</h2>
          <p className="text-lg text-gray-300 mb-4">Ocorreu um erro durante o processamento. Por favor, tente novamente.</p>
          <Button onClick={() => navigate('/criar')} variant="primary">
            Criar Novo Projeto
          </Button>
        </div>
      );
    }
    return null; // For completed status, content will be rendered
  };

  if (loading || !project || project.status !== ProjectStatus.COMPLETED) {
    return (
      <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 animate-fadeIn">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/criar')} className="text-primary-cyan hover:text-dark-background-start hover:bg-primary-cyan">
            ← Voltar
          </Button>
          <h1 className="text-3xl font-montserrat font-extrabold text-light-text flex-grow text-center">
            Branding Completo
          </h1>
          <Button disabled variant="primary" size="md">
            Download ZIP
          </Button>
        </header>
        <main className="flex-grow flex items-center justify-center">
          {renderStatusMessage()}
          {loading && project?.status === ProjectStatus.PROCESSING && <ContentSkeleton />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <header className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-gradient-to-br from-[#0A0F1C] to-[#001220] py-4 rounded-b-lg shadow-lg">
        <Button variant="ghost" onClick={() => navigate('/criar')} className="text-primary-cyan hover:text-dark-background-start hover:bg-primary-cyan">
          ← Voltar
        </Button>
        <h1 className="text-3xl font-montserrat font-extrabold text-light-text flex-grow text-center">
          Branding Completo
        </h1>
        <Button onClick={handleDownloadZip} loading={downloading} variant="primary" size="md">
          <span className="mr-2">📥</span> Baixar ZIP
        </Button>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full space-y-8 pb-16">
        <Card>
          <h2 className="text-3xl font-montserrat font-extrabold text-light-text mb-2">
            {project.name}
            <span className="text-primary-cyan text-xl ml-3">({project.niche})</span>
          </h2>
          {project.slogan && (
            <p className="text-2xl italic font-semibold text-gray-200 border-l-4 border-primary-cyan pl-3 mt-4">
              "{project.slogan}"
            </p>
          )}
        </Card>

        {project.colorPalette && project.colorPalette.length > 0 && (
          <Card>
            <h3 className="text-2xl font-montserrat font-bold text-light-text mb-4">Paleta de Cores</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {project.colorPalette.map((color, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-24 h-24 rounded-lg shadow-md border border-gray-600"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="mt-2 text-sm font-mono text-gray-300">{color}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {project.logos && project.logos.length > 0 && (
          <Card>
            <h3 className="text-2xl font-montserrat font-bold text-light-text mb-4">Logos</h3>
            <p className="text-gray-400 text-sm mb-4">
              Clique nas imagens para visualização ampliada. Logos disponíveis para download no pacote ZIP em formato PNG.
              <br />
              <em className="text-primary-cyan">O formato SVG não é suportado no momento pela IA.</em>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {project.logos.map((logo) => (
                <div key={logo.id} className="bg-dark-background-start rounded-lg p-4 flex flex-col items-center border border-primary-cyan/20">
                  <img
                    src={logo.url}
                    alt={`Logo Variação ${logo.variacao}`}
                    className="w-full h-auto max-w-48 object-contain mb-3 bg-white p-2 rounded cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => setSelectedImageUrl(logo.url)}
                  />
                  <p className="text-gray-300 text-sm">Variação {logo.variacao}</p>
                  <Button
                    onClick={() => handleRegenerateLogo(logo)}
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-sm"
                    loading={regeneratingLogoId === logo.id}
                    disabled={regeneratingLogoId !== null}
                  >
                    {regeneratingLogoId === logo.id ? 'Gerando...' : 'Gerar Novamente'}
                  </Button>
                  {(logo.positivePrompt || logo.negativePrompt) && (
                    <div className="mt-4 w-full">
                      <details className="text-primary-cyan cursor-pointer text-sm">
                        <summary className="font-semibold hover:text-accent-purple transition-colors">Ver Prompts para Geração Contínua</summary>
                        <div className="mt-2 text-gray-400 text-xs text-left p-2 bg-dark-background-end rounded-md">
                          {logo.positivePrompt && (
                            <p className="mb-2"><strong>Prompt Positivo:</strong> {logo.positivePrompt}</p>
                          )}
                          {logo.negativePrompt && (
                            <p><strong>Prompt Negativo:</strong> {logo.negativePrompt}</p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {project.banners && project.banners.length > 0 && (
          <Card>
            <h3 className="text-2xl font-montserrat font-bold text-light-text mb-4">Banners</h3>
            <p className="text-gray-400 text-sm mb-4">
              Clique nas imagens para visualização ampliada. Banners disponíveis para download no pacote ZIP em formato PNG.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.banners.map((banner) => (
                <div key={banner.id} className="bg-dark-background-start rounded-lg p-4 flex flex-col items-center border border-primary-cyan/20">
                  <img
                    src={banner.url}
                    alt={`Banner ${banner.formato}`}
                    className="w-full h-auto max-h-80 object-contain mb-3 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 border border-primary-cyan/20" /* Removido bg-white p-2 */
                    onClick={() => setSelectedImageUrl(banner.url)}
                  />
                  <p className="text-gray-300 text-sm">{BANNER_FORMAT_LABELS[banner.formato]}</p>
                  <Button
                    onClick={() => handleRegenerateBanner(banner)}
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-sm"
                    loading={regeneratingBannerId === banner.id}
                    disabled={regeneratingBannerId !== null}
                  >
                    {regeneratingBannerId === banner.id ? 'Gerando...' : 'Gerar Novamente'}
                  </Button>
                   {(banner.positivePrompt || banner.negativePrompt) && (
                    <div className="mt-4 w-full">
                      <details className="text-primary-cyan cursor-pointer text-sm">
                        <summary className="font-semibold hover:text-accent-purple transition-colors">Ver Prompts para Geração Contínua</summary>
                        <div className="mt-2 text-gray-400 text-xs text-left p-2 bg-dark-background-end rounded-md">
                          {banner.positivePrompt && (
                            <p className="mb-2"><strong>Prompt Positivo:</strong> {banner.positivePrompt}</p>
                          )}
                          {banner.negativePrompt && (
                            <p><strong>Prompt Negativo:</strong> {banner.negativePrompt}</p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {project.mediaAnalysis && (
          <Card>
            <h3 className="text-2xl font-montserrat font-bold text-light-text mb-4">Análise de Mídia</h3>
            <p className="text-gray-300 mb-4">{project.mediaAnalysis.resumo}</p>
            <p className="text-gray-300 mb-4"><strong className="text-primary-cyan">Público-alvo ideal:</strong> {project.mediaAnalysis.publicoAlvo}</p>
            <p className="text-gray-300 mb-4"><strong className="text-primary-cyan">Tom de comunicação recomendado:</strong> {project.mediaAnalysis.tonalidadeComunicacao}</p>
            <StrategyList title="Pontos Fortes da Marca" items={project.mediaAnalysis.pontosFortes} />
            <StrategyList title="Oportunidades de Mercado" items={project.mediaAnalysis.oportunidades} />
          </Card>
        )}

        {project.socialMediaStrategy && (
          <Card>
            <h3 className="text-2xl font-montserrat font-bold text-light-text mb-4">Estratégia de Mídia Social</h3>
            <p className="text-gray-300 mb-4"><strong className="text-primary-cyan">Objetivo Principal:</strong> {project.socialMediaStrategy.objetivoPrincipal}</p>
            <StrategyList title="Plataformas Sociais Recomendadas" items={project.socialMediaStrategy.plataformasRecomendadas} />
            <StrategyList title="Tipos de Conteúdo para Produzir" items={project.socialMediaStrategy.tiposConteudo} />
            <p className="text-gray-300 mb-4"><strong className="text-primary-cyan">Frequência de Postagem:</strong> {project.socialMediaStrategy.frequenciaPostagem}</p>
            <StrategyList title="Hashtags Relevantes" items={project.socialMediaStrategy.hashtags} />
          </Card>
        )}

        {project.paidTrafficStrategy && (
          <Card>
            <h3 className="text-2xl font-montserrat font-bold text-light-text mb-4">Estratégia de Tráfego Pago</h3>
            <StrategyList title="Plataformas de Anúncios Recomendadas" items={project.paidTrafficStrategy.plataformasAnuncios} />
            <p className="text-gray-300 mb-4"><strong className="text-primary-cyan">Orçamento Mensal Sugerido:</strong> {project.paidTrafficStrategy.orcamentoMensal}</p>
            <p className="text-gray-300 mb-4"><strong className="text-primary-cyan">Segmentação Ideal:</strong> {project.paidTrafficStrategy.segmentacaoIdeal}</p>
            <StrategyList title="Tipos de Anúncios Recomendados" items={project.paidTrafficStrategy.tiposAnuncios} />
            <StrategyList title="Métricas Importantes para Acompanhar" items={project.paidTrafficStrategy.metricasImportantes} />
          </Card>
        )}

        <div className="sticky bottom-0 z-10 bg-gradient-to-t from-[#0A0F1C] to-transparent py-4 text-center">
          <Button onClick={handleDownloadZip} loading={downloading} size="lg" className="w-full max-w-md">
            <span className="mr-2">📥</span> Baixar Pacote Completo (.ZIP)
          </Button>
        </div>
      </main>

      {selectedImageUrl && (
        <ImageModal
          imageUrl={selectedImageUrl}
          altText="Imagem ampliada do branding"
          onClose={() => setSelectedImageUrl(null)}
        />
      )}
    </div>
  );
};