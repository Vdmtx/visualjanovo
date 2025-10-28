import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { getProjects, deleteProject } from '../services/apiService';
import { BrandingProject, ProjectStatus } from '../types';
import { Card } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState<BrandingProject[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState<boolean>(true);

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, []);

  const handleStartCreation = () => {
    navigate('/criar');
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza de que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      try {
        await deleteProject(projectId);
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      } catch (error) {
        console.error("Failed to delete project", error);
      }
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const baseClasses = "inline-block px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case ProjectStatus.COMPLETED:
        return <span className={`${baseClasses} bg-green-500/20 text-green-300 border border-green-500/30`}>Completo</span>;
      case ProjectStatus.PROCESSING:
        return <span className={`${baseClasses} bg-blue-500/20 text-blue-300 border border-blue-500/30`}>Processando</span>;
      case ProjectStatus.FAILED:
        return <span className={`${baseClasses} bg-red-500/20 text-red-300 border border-red-500/30`}>Falhou</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <h1 className="text-3xl font-montserrat font-extrabold text-primary-cyan">Visual Já</h1>
        <div className="hidden sm:block text-light-text font-inter text-lg">Crie sua marca. Sozinho.</div>
        <Button onClick={handleStartCreation} variant="primary" size="md" className="text-dark-background-start">
          Começar Agora
        </Button>
      </header>

      <main className="relative z-0 flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-20 animate-fadeIn">
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold bg-primary-cyan/20 text-primary-cyan rounded-full shadow-md">
            ✨ Anti-Agência 2025
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-montserrat font-extrabold text-light-text leading-tight mb-4">
          CRIE SUA MARCA, <br />
          <span className="text-primary-cyan">Sem agência, sem social mídia, só você e o app.</span>
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl">
          Tudo que uma agência faria – agora em um clique.
        </p>

        <Button onClick={handleStartCreation} variant="primary" size="lg" className="mb-12">
          ⚡ Gerar Branding Completo
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="bg-primary-cyan/10 p-5 rounded-xl shadow-lg text-primary-cyan border border-primary-cyan/20">
            <p className="text-3xl font-montserrat font-bold mb-1">4</p>
            <p className="text-sm font-inter">Variações de logo geradas automaticamente</p>
          </div>
          <div className="bg-primary-cyan/10 p-5 rounded-xl shadow-lg text-primary-cyan border border-primary-cyan/20">
            <p className="text-3xl font-montserrat font-bold mb-1">3</p>
            <p className="text-sm font-inter">Formatos de banners (1:1, 9:16, 4:5)</p>
          </div>
          <div className="bg-primary-cyan/10 p-5 rounded-xl shadow-lg text-primary-cyan border border-primary-cyan/20">
            <p className="text-3xl font-montserrat font-bold mb-1">100%</p>
            <p className="text-sm font-inter">Análise de mídia e estratégia completa</p>
          </div>
        </div>
      </main>

      <section className="mt-16 max-w-4xl w-full">
        <h3 className="text-3xl font-montserrat font-bold text-light-text mb-6 text-center">Projetos Recentes</h3>
        {loadingProjects ? (
          <div className="text-center text-gray-400">Carregando projetos...</div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Card key={project.id} className="flex flex-col justify-between hover:border-primary-cyan transition-colors">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold font-montserrat text-light-text truncate pr-2" title={project.name}>{project.name}</h4>
                    {getStatusBadge(project.status)}
                  </div>
                  <p className="text-sm text-gray-400 mb-2 truncate" title={project.niche}>{project.niche}</p>
                  <p className="text-xs text-gray-500">Criado em: {new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/resultado/${project.id}`)}>
                    Abrir
                  </Button>
                  <Button variant="danger" size="sm" onClick={(e) => handleDeleteProject(e, project.id)}>
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 p-8 bg-primary-cyan/5 rounded-lg">
            <p>Você ainda não criou nenhum projeto.</p>
            <Button onClick={handleStartCreation} variant="primary" size="md" className="mt-4 text-dark-background-start">
              Começar Agora
            </Button>
          </div>
        )}
      </section>

      <section className="bg-gradient-to-r from-primary-cyan/10 to-transparent p-8 mt-16 rounded-xl max-w-4xl w-full text-center">
        <h3 className="text-3xl font-montserrat font-bold text-light-text mb-6">Como Funciona:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-light-text">
            <p className="text-5xl font-montserrat font-extrabold text-primary-cyan mb-2">1.</p>
            <p className="text-xl font-semibold mb-2">Digite sua ideia</p>
            <p className="text-gray-300">Informe nome, nicho e descrição. Adicione referências visuais se desejar.</p>
          </div>
          <div className="text-light-text">
            <p className="text-5xl font-montserrat font-extrabold text-primary-cyan mb-2">2.</p>
            <p className="text-xl font-semibold mb-2">A IA faz o resto</p>
            <p className="text-gray-300">Análise, estratégia, logos e banners criados automaticamente.</p>
          </div>
          <div className="text-light-text">
            <p className="text-5xl font-montserrat font-extrabold text-primary-cyan mb-2">3.</p>
            <p className="text-xl font-semibold mb-2">Baixe e publique</p>
            <p className="text-gray-300">Pacote completo em ZIP pronto para redes sociais e campanhas.</p>
          </div>
        </div>
      </section>

      <footer className="mt-20 py-8 text-center text-gray-400 text-sm w-full">
        <p className="mb-2">© 2025 Visual Já – Desenvolvido por Vdmtx Nexus Éter</p>
        <p className="font-semibold text-primary-cyan">"Visual Já é o código da libertação."</p>
      </footer>
    </div>
  );
};
