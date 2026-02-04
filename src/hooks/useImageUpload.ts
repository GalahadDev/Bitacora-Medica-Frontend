import { useState } from 'react';
import { endpoints } from '@/lib/api';

export function useImageUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (file: File, patientId: string): Promise<string | null> => {

        if (!file.type.startsWith('image/')) {
            setError("El archivo debe ser una imagen");
            return null;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB límite
            setError("La imagen no debe superar los 5MB");
            return null;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await endpoints.uploads.image(formData, patientId);
            return response.data.signed_url || response.data.url;
        } catch (err) {
            console.error(err);
            setError("Error al subir la imagen");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadImage, isUploading, error };
}