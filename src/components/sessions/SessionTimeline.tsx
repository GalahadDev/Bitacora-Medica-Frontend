import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Calendar, Activity, AlertCircle, Clock, HeartPulse } from 'lucide-react';
import SessionDetailModal from './SessionDetailModal';

interface SessionTimelineProps {
    patientId: string;
    filterProfessional?: string;
    onEditSession: (session: any) => void;
}

export default function SessionTimeline({ patientId, filterProfessional, onEditSession }: SessionTimelineProps) {
    const { user } = useAuthStore();
    const [selectedSession, setSelectedSession] = useState<any>(null);

    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['sessions', patientId, filterProfessional],
        queryFn: async () => {
            const res = await endpoints.sessions.list(patientId, filterProfessional);
            return res.data.data || [];
        }
    });

    if (isLoading) return <div className="py-8 text-center text-gray-400">Cargando historial...</div>;

    if (sessions.length === 0 && filterProfessional) {
        return <div className="py-10 text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">No se encontraron evoluciones para este profesional.</div>;
    }

    if (sessions.length === 0) return <div className="py-10 text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">No hay evoluciones registradas aún.</div>;

    return (
        <>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-slate-700 before:to-transparent">
                {sessions.map((session: any) => {
                    const isAuthor = user?.id === session.ProfessionalID;

                    let creatorData = session.Creator?.ProfileData || {};
                    if (typeof creatorData === 'string') {
                        try { creatorData = JSON.parse(creatorData); } catch (e) { creatorData = {}; }
                    }

                    const creatorName = creatorData.full_name || creatorData.name || "Profesional";
                    const creatorRole = creatorData.specialty || "Especialista";
                    const creatorInitials = creatorName.slice(0, 2).toUpperCase();
                    const creatorAvatar = creatorData.avatar_url || creatorData.picture;
                    const date = new Date(session.CreatedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
                    const time = new Date(session.CreatedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    const vitals = typeof session.Vitals === 'string' ? JSON.parse(session.Vitals) : session.Vitals;

                    let photos: string[] = [];
                    if (Array.isArray(session.Photos)) {
                        photos = session.Photos;
                    } else if (typeof session.Photos === 'string') {
                        try { photos = JSON.parse(session.Photos); } catch (e) { photos = []; }
                    }

                    return (
                        <div key={session.ID} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Icono Central */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-800 group-[.is-active]:bg-blue-500 text-gray-500 dark:text-gray-400 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                {session.HasIncident ? <AlertCircle className="w-5 h-5 text-red-200" /> : <Activity className="w-5 h-5" />}
                            </div>

                            {/* Tarjeta de Sesión */}
                            <div
                                onClick={() => setSelectedSession(session)}
                                className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group/card"
                            >

                                {/* Header Tarjeta */}
                                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-50 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                                            {creatorAvatar ? (
                                                <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
                                            ) : (
                                                creatorInitials
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">{creatorName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{creatorRole}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" /> {date}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                                            <Clock className="w-3 h-3" /> {time}
                                        </div>
                                    </div>
                                </div>

                                {/* Cuerpo Resumen */}
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium line-clamp-1">{session.InterventionPlan}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{session.Description}</p>

                                    {/* Vitals Mini */}
                                    {vitals && (
                                        <div className="flex gap-3 mt-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg overflow-x-auto">
                                            {vitals.fc && <span className="text-xs text-gray-600 dark:text-gray-300 flex gap-1"><HeartPulse className="w-3 h-3 text-red-500" /> <strong>FC:</strong> {vitals.fc}</span>}
                                            {vitals.pa && <span className="text-xs text-gray-600 dark:text-gray-300"><strong>PA:</strong> {vitals.pa}</span>}
                                            {vitals.sato2 && <span className="text-xs text-gray-600 dark:text-gray-300"><strong>Sat:</strong> {vitals.sato2}%</span>}
                                        </div>
                                    )}

                                    {/* Alerta de Incidente */}
                                    {session.HasIncident && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div className="font-semibold">Incidente Reportado (Ver detalle)</div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer: Fotos y Acciones */}
                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex -space-x-2">
                                        {photos.slice(0, 3).map((photo, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-700 block overflow-hidden">
                                                <img src={photo} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        ))}
                                        {photos.length > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                                                +{photos.length - 3}
                                            </div>
                                        )}
                                    </div>

                                    {isAuthor ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditSession(session);
                                            }}
                                            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline z-10"
                                        >
                                            Editar
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-medium">Ver detalles</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <SessionDetailModal
                isOpen={!!selectedSession}
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
            />
        </>
    );
}