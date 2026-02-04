import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import {
    FileText, Calendar, Download, Trash2, Eye,
    Plus, FileImage, File as FileIcon, Search, Filter
} from 'lucide-react';
import DocumentUploadModal from './DocumentUploadModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import DocumentViewerModal from '@/components/ui/DocumentViewerModal';
import DatePicker from '@/components/ui/DatePicker';

interface DocumentRepositoryProps {
    patientId: string;
}

export default function DocumentRepository({ patientId }: DocumentRepositoryProps) {
    const queryClient = useQueryClient();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<{ id: string, name: string } | null>(null);
    const [docToView, setDocToView] = useState<{ url: string, type: string, name: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    const { data: documents, isLoading, isError } = useQuery({
        queryKey: ['patient-documents', patientId],
        queryFn: async () => {
            const res = await endpoints.patients.getDocuments(patientId);
            return res.data.data || [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (docId: string) => {
            await endpoints.patients.deleteDocument(docId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
            setDocToDelete(null);
        }
    });

    const filteredDocuments = documents?.filter((doc: any) => {
        const matchesSearch = doc.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.Description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || doc.Category === categoryFilter;
        const matchesDate = !dateFilter || doc.Date.startsWith(dateFilter);

        return matchesSearch && matchesCategory && matchesDate;
    });

    const getFileIcon = (fileType: string) => {
        const type = fileType?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return <FileImage className="w-8 h-8 text-purple-500" />;
        if (type === 'pdf') return <FileText className="w-8 h-8 text-red-500" />;
        return <FileIcon className="w-8 h-8 text-blue-500" />;
    };

    const getCategoryBadge = (category: string) => {
        const styles: Record<string, string> = {
            'LAB': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'IMAGING': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800',
            'PRESCRIPTION': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800',
            'OTHER': 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        };
        const labels: Record<string, string> = {
            'LAB': 'Laboratorio',
            'IMAGING': 'Imagenología',
            'PRESCRIPTION': 'Receta',
            'OTHER': 'Otro'
        };
        return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${styles[category] || styles['OTHER']}`}>
                {labels[category] || category}
            </span>
        );
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando documentos...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error al cargar documentos.</div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Repositorio de Documentos
                        <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">{documents?.length || 0}</span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona exámenes, recetas e informes del paciente.</p>
                </div>

                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Subir Documento
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
                    >
                        <option value="ALL">Todas las categorías</option>
                        <option value="LAB">Laboratorio</option>
                        <option value="IMAGING">Imagenología</option>
                        <option value="PRESCRIPTION">Receta</option>
                        <option value="OTHER">Otro</option>
                    </select>
                </div>

                <div className="relative">
                    <DatePicker
                        value={dateFilter}
                        onChange={(date) => setDateFilter(date)}
                        placeholder="Filtrar por fecha"
                        className="w-full"
                    />
                </div>
            </div>

            {/* Grid de Documentos */}
            {filteredDocuments?.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-gray-900 dark:text-gray-100 font-medium mb-1">No se encontraron documentos</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {documents?.length === 0 ? "El repositorio está vacío." : "Intenta con otros filtros de búsqueda."}
                    </p>
                    {documents?.length === 0 && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="text-blue-600 hover:underline text-sm font-medium"
                        >
                            Subir primer documento
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc: any) => (
                        <div key={doc.ID} className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md rounded-xl p-4 transition-all relative flex flex-col h-full">
                            {/* Card Content */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="shrink-0 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 transition-colors">
                                    {getFileIcon(doc.FileType)}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                        {getCategoryBadge(doc.Category)}
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 ml-auto whitespace-nowrap">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(doc.Date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate w-full block" title={doc.Name}>
                                        {doc.Name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 w-full block">
                                        {doc.Description || "Sin descripción"}
                                    </p>
                                </div>
                            </div>

                            {/* Actions Overlay / Footer */}
                            <div className="mt-auto pt-3 border-t border-gray-50 dark:border-slate-800 flex justify-end gap-2">
                                <button
                                    onClick={() => setDocToView({ url: doc.FileUrl, type: doc.FileType, name: doc.Name })}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Ver Documento"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <a
                                    href={doc.FileUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Descargar"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => setDocToDelete({ id: doc.ID, name: doc.Name })}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                patientId={patientId}
            />

            <ConfirmationModal
                isOpen={!!docToDelete}
                onClose={() => setDocToDelete(null)}
                onConfirm={() => docToDelete && deleteMutation.mutate(docToDelete.id)}
                title="Eliminar Documento"
                message={`¿Estás seguro que quieres eliminar el documento "${docToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                isDestructive={true}
                isLoading={deleteMutation.isPending}
            />

            <DocumentViewerModal
                isOpen={!!docToView}
                onClose={() => setDocToView(null)}
                title={docToView?.name || "Documento"}
                fileUrl={docToView?.url}
                fileType={docToView?.type}
                downloadUrl={docToView?.url}
            />
        </div>
    );
}
