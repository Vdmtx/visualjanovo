import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { ImagePreview } from '../components/ui/ImagePreview';
import { createProject } from '../services/apiService';
import { useToast, ToastType } from '../components/ui/Toast';
import { DEFAULT_BRAND_NAME, DEFAULT_NICHE, DEFAULT_DESCRIPTION } from '../constants';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [brandName, setBrandName] = React.useState<string>(DEFAULT_BRAND_NAME);
  const [niche, setNiche] = React.useState<string>(DEFAULT_NICHE);
  const [description, setDescription] = React.useState<string>(DEFAULT_DESCRIPTION);
  const [visualReferences, setVisualReferences] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{ brandName?: string; niche?: string; references?: string }>({});

  const MAX_FILE_SIZE_MB = 5; // Max 5MB per file

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Fix: Explicitly cast 'file' to 'File'
      const newFiles = Array.from(event.target.files).filter((file: File) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          addToast(`A imagem '${file.name}' excede o tamanho máximo de ${MAX_FILE_SIZE_MB}MB.`, ToastType.ERROR);
          return false;
        }
        return true;
      });
      setVisualReferences((prev) => [...prev, ...newFiles]);
      setErrors((prev) => ({ ...prev, references: undefined }));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      // Fix: Explicitly cast 'file' to 'File'
      const newFiles = Array.from(event.dataTransfer.files).filter((file: File) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          addToast(`A imagem '${file.name}' excede o tamanho máximo de ${MAX_FILE_SIZE_MB}MB.`, ToastType.ERROR);
          return false;
        }
        return true;
      });
      setVisualReferences((prev) => [...prev, ...newFiles]);
      setErrors((prev) => ({ ...prev, references: undefined }));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const removeReference = (fileToRemove: File) => {
    setVisualReferences((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const validateForm = () => {
    const newErrors: { brandName?: string; niche?: string; references?: string } = {};
    if (!brandName.trim()) {
      newErrors.brandName = 'Nome da marca é obrigatório.';
    }
    if (!niche.trim()) {
      newErrors.niche = 'Nicho/área de atuação é obrigatório.';
    }
    // Optional: Add more validation for file types if needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      addToast('Por favor, corrija os erros no formulário.', ToastType.ERROR);
      return;
    }

    setIsSubmitting(true);
    addToast('Gerando seu branding completo...', ToastType.INFO);

    try {
      const project = await createProject(brandName, niche, description, visualReferences);
      navigate(`/resultado/${project.id}`);
    } catch (error: any) {
      addToast(`Falha ao gerar branding: ${error.message}`, ToastType.ERROR);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <header className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-primary-cyan hover:text-dark-background-start hover:bg-primary-cyan">
          ← Voltar
        </Button>
        <h1 className="text-3xl font-montserrat font-extrabold text-light-text flex-grow text-center">
          Crie sua marca em <span className="text-primary-cyan">segundos</span>
        </h1>
        <div className="w-24"></div> {/* Placeholder to balance header */}
      </header>

      <main className="flex-grow flex items-center justify-center">
        <Card className="max-w-3xl w-full p-6 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="brandName"
              label="Nome da Marca"
              placeholder="Ex: Minha Empresa Inc."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              error={errors.brandName}
              required
            />
            <Input
              id="niche"
              label="Nicho/Área de Atuação"
              placeholder="Ex: E-commerce de moda sustentável"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              error={errors.niche}
              required
            />
            <Textarea
              id="description"
              label="Descrição Detalhada (opcional)"
              placeholder="Conte mais sobre sua marca, seus valores e o que a torna única."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-light-text">
                Referências Visuais (opcional, múltiplas imagens, máx {MAX_FILE_SIZE_MB}MB cada)
              </label>
              <div
                className={`flex items-center justify-center w-full h-32 rounded-lg border-2 border-dashed ${
                  errors.references ? 'border-red-500' : 'border-primary-cyan/50'
                } bg-dark-background-start hover:border-primary-cyan transition-colors cursor-pointer`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('fileUpload')?.click()}
              >
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-gray-400">Arraste e solte ou clique para fazer upload de imagens</p>
              </div>
              {errors.references && <p className="mt-1 text-sm text-red-500">{errors.references}</p>}
              <div className="flex flex-wrap gap-3 mt-4">
                {visualReferences.map((file, index) => (
                  <ImagePreview key={index} file={file} onRemove={removeReference} />
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? 'Eliminando intermediários...' : '⚡ Gerar Branding Completo'}
            </Button>
          </form>
        </Card>
      </main>

      <footer className="mt-8 text-center text-gray-400 text-xs sm:text-sm">
        <p>4 logos, 3 banners, ZIP package</p>
      </footer>
    </div>
  );
};