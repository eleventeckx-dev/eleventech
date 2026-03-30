import { supabase } from './supabase';

/**
 * Faz upload de uma imagem para o Supabase Storage.
 * @param file O arquivo a ser enviado.
 * @returns A URL pública da imagem.
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`;
    const filePath = `collections/${fileName}`;

    // 1. Upload do arquivo
    const { error: uploadError, data } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // 2. Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Erro no upload para o Supabase:", error);
    // Em caso de erro (ex: bucket não criado), mantemos o log e lançamos a exceção
    throw error;
  }
};
