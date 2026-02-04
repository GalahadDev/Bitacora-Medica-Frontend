import { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, HeartPulse } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface SessionDetailModalProps {
    session: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function SessionDetailModal({ session, isOpen, onClose }: SessionDetailModalProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!isOpen || !session) return null;

    let creator = session.Creator?.ProfileData || {};
    if (typeof creator === 'string') {
        try { creator = JSON.parse(creator); } catch (e) { console.error(e); }
    }
    const creatorName = creator.full_name || creator.name || "Profesional";
    const creatorRole = creator.specialty || "Especialista";
    const creatorInitials = creatorName.slice(0, 2).toUpperCase();
    const date = new Date(session.CreatedAt).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const time = new Date(session.CreatedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const vitals = typeof session.Vitals === 'string' ? JSON.parse(session.Vitals) : session.Vitals;

    let photos: string[] = [];
    if (Array.isArray(session.Photos)) {
        photos = session.Photos;
    } else if (typeof session.Photos === 'string') {
        try { photos = JSON.parse(session.Photos); } catch (e) { photos = []; }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-h-[90vh] overflow-hidden" showCloseButton={false}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-full">

                {/* Header con Perfil del Especialista */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-gray-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {creatorInitials}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{creatorName}</h3>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{creatorRole}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Cuerpo Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Signos Vitales */}
                    {vitals && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 flex flex-wrap gap-4 md:gap-8 justify-center">
                            <div className="text-center">
                                <span className="text-xs text-blue-400 font-bold uppercase block">Frecuencia C.</span>
                                <span className="text-lg font-bold text-blue-700 flex items-center gap-1 justify-center">
                                    <HeartPulse className="w-4 h-4" /> {vitals.fc || "--"} <span className="text-xs font-normal text-blue-500">lpm</span>
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="text-xs text-blue-400 font-bold uppercase block">Presión A.</span>
                                <span className="text-lg font-bold text-blue-700">{vitals.pa || "--"} <span className="text-xs font-normal text-blue-500">mmHg</span></span>
                            </div>
                            <div className="text-center">
                                <span className="text-xs text-blue-400 font-bold uppercase block">Sat O2</span>
                                <span className="text-lg font-bold text-blue-700">{vitals.sato2 || "--"} <span className="text-xs font-normal text-blue-500">%</span></span>
                            </div>
                            <div className="text-center">
                                <span className="text-xs text-blue-400 font-bold uppercase block">Dolor (EVA)</span>
                                <span className="text-lg font-bold text-blue-700">{vitals.pain || "0"}<span className="text-xs font-normal text-blue-500">/10</span></span>
                            </div>
                        </div>
                    )}

                    {/* Información Clínica */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Plan de Intervención</h4>
                            <p className="text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                                {session.InterventionPlan}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Descripción de la Evolución</h4>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {session.Description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Logros</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 border-l-2 border-green-400 pl-3 py-1">
                                    {session.Achievements || "No registrados"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Desempeño</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 border-l-2 border-blue-400 pl-3 py-1">
                                    {session.PatientPerformance || "No registrado"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Incidentes */}
                    {session.HasIncident && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
                                <AlertCircle className="w-5 h-5" />
                                Reporte de Incidente
                            </div>
                            <p className="text-red-800 text-sm mb-3">{session.IncidentDetails}</p>
                            {session.IncidentPhoto && (
                                <div className="mt-2">
                                    <p className="text-xs text-red-400 mb-1 font-bold">Evidencia del Incidente:</p>
                                    <img src={session.IncidentPhoto} alt="Incidente" className="w-32 h-32 object-cover rounded-lg border border-red-200" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Galería de Fotos */}
                    {photos.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Evidencia Fotográfica</h4>
                            <div className="flex flex-wrap gap-2">
                                {photos.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(url)}
                                        className="block w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <img src={url} className="w-full h-full object-cover" alt={`Evidencia ${idx}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm">
                        Cerrar
                    </button>
                </div>

            </div>

            {/* Lightbox para ver imágenes */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Vista detallada"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </Modal>
    );
}