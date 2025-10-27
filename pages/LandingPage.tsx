import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartCreation = () => {
    navigate('/criar');
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