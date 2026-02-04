import { X, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface ConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
}

export default function ConsentModal({ isOpen, onClose, pdfUrl }: ConsentModalProps) {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="w-full flex justify-center">
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Consentimiento Informado
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 bg-gray-100 p-1">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full rounded-b-xl border-none"
                            title="Consentimiento Informado PDF"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No hay documento PDF disponible
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </Modal>
    );
}
