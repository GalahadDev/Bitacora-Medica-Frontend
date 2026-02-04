import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileText, Loader2, Calendar, Tag, File as FileIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import DatePicker from '@/components/ui/DatePicker';

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
}

const CATEGORIES = [
    { value: 'LAB', label: 'Laboratorio' },
    { value: 'IMAGING', label: 'Imagenología' },
    { value: 'PRESCRIPTION', label: 'Receta Médica' },
    { value: 'OTHER', label: 'Otro' }
];

export default function DocumentUploadModal({ isOpen, onClose, patientId }: DocumentUploadModalProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('LAB');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            await endpoints.patients.uploadDocument(patientId, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
            resetForm();
            onClose();
        },
        onError: (err: any) => {
            console.error("Upload error:", err);
            setError(err.response?.data?.error || "Error al subir el documento. Intenta nuevamente.");
        }
    });

    const resetForm = () => {
        setName('');
        setCategory('LAB');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setFile(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !date || !category || !file) {
            setError("Por favor completa todos los campos obligatorios.");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('date', date);
        formData.append('description', description);
        formData.append('file', file);

        uploadMutation.mutate(formData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!name) {
                const fileName = e.target.files[0].name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
                setName(fileName);
            }
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        Subir Documento
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* 1. File Upload Area */}
                        <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-slate-900/50 group cursor-pointer relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    {file ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                                </div>
                                {file ? (
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{file.name}</p>
                                        <p className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">Haz clic o arrastra un archivo aquí</p>
                                        <p className="text-xs mt-1">Soporta PDF, JPG, PNG, Word</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Basic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    <FileIcon className="w-3 h-3" /> Nombre del Documento
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Examen de Sangre..."
                                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all dark:text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Fecha del Documento
                                </label>
                                <DatePicker
                                    value={date}
                                    onChange={setDate}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* 3. Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Categoría
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategory(cat.value)}
                                        className={`p-2 text-xs font-medium rounded-lg border transition-all ${category === cat.value
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Description */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Descripción / Observaciones (Opcional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all resize-none dark:text-white"
                                placeholder="Añade notas adicionales sobre el documento..."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="upload-form"
                        disabled={uploadMutation.isPending}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Subir Documento
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
