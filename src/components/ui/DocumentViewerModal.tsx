import { X, Download, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fileUrl?: string; // For images/PDFs
    fileType?: string; // 'pdf' | 'image' | 'other'
    content?: string; // For HTML reports
    downloadUrl?: string; // Optional download link
}

export default function DocumentViewerModal({
    isOpen,
    onClose,
    title,
    fileUrl,
    fileType,
    content,
    downloadUrl
}: DocumentViewerModalProps) {
    if (!isOpen) return null;

    const isPdf = fileType?.toLowerCase() === 'pdf' || fileUrl?.toLowerCase().endsWith('.pdf');
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => fileType?.toLowerCase().includes(ext) || fileUrl?.toLowerCase().endsWith(ext));



    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-gray-100 dark:border-slate-800 relative">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 truncate pr-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {title}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                        {downloadUrl && (
                            <a
                                href={downloadUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-600"
                                title="Descargar"
                            >
                                <Download className="w-5 h-5" />
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-black/20 relative p-4 flex items-center justify-center">

                    {content ? (
                        <div className="w-full h-full bg-white shadow-sm overflow-y-auto p-8 rounded-xl max-w-4xl mx-auto custom-scrollbar text-gray-900">
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    ) : fileUrl ? (
                        isPdf ? (
                            <iframe
                                src={`${fileUrl}#view=FitH`}
                                className="w-full h-full rounded-lg shadow-sm bg-white"
                                title="Document Viewer"
                            />
                        ) : isImage ? (
                            <img
                                src={fileUrl}
                                alt={title}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                            />
                        ) : (
                            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Vista previa no disponible</p>
                                <p className="text-sm text-gray-500 mb-6">Este tipo de archivo no se puede visualizar directamente.</p>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar Archivo
                                </a>
                            </div>
                        )
                    ) : (
                        <div className="text-center text-gray-500">No hay contenido para mostrar</div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
