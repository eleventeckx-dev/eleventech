import React, { useCallback, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/storage';

interface ImageUploadProps {
  value?: string;
  onChange: (base64String: string) => void;
  isLoading?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, isLoading = false }) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = isLoading || internalLoading;

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (loading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Apenas arquivos de imagem são suportados.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem excede o limite de 5MB.');
      return;
    }

    try {
      setInternalLoading(true);
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error('Falha no upload', err);
      alert('Erro ao realizar upload da imagem. Verifique sua conexão.');
    } finally {
      setInternalLoading(false);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="w-full">
      <div 
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all bg-white overflow-hidden group 
          ${value ? 'border-primary/50' : 'border-agro-stone/20 hover:border-agro-forest/50 hover:bg-agro-forest/5 cursor-pointer'}`}
      >
        <input 
          type="file" 
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={loading}
        />
        
        {loading ? (
          <div className="flex flex-col items-center text-agro-forest">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p className="text-sm font-medium">Processando imagem...</p>
          </div>
        ) : value ? (
          <>
            <img 
              src={value} 
              alt="Upload preview" 
              className="absolute inset-0 w-full h-full object-cover rounded-lg scale-100 group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark overlay for hover actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button"
                onClick={clearImage}
                className="bg-red-500 text-white p-2 text-sm rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium z-10"
              >
                <X size={16} /> Remover Foto
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-agro-stone">
            <div className="mb-3 p-3 bg-agro-stone/10 rounded-full group-hover:bg-agro-forest/10 group-hover:text-agro-forest transition-colors">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700 mb-1">
              Arraste a miniatura ou <span className="text-agro-forest">clique para buscar</span>
            </p>
            <p className="text-xs text-slate-500">
              PNG, JPG, WEBP (Máximo 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
