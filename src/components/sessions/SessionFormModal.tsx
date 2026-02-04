import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { X, Camera, AlertTriangle, Save, Loader2, Trash2 } from 'lucide-react';
import { endpoints } from '@/lib/api';
import { useImageUpload } from '@/hooks/useImageUpload';
import Modal from '@/components/ui/Modal';

interface SessionFormModalProps {
    patientId: string;
    isOpen: boolean;
    onClose: () => void;
    sessionToEdit?: any;
}

export default function SessionFormModal({ patientId, isOpen, onClose, sessionToEdit }: SessionFormModalProps) {

    const queryClient = useQueryClient();
    const { uploadImage, isUploading } = useImageUpload();
    const [photos, setPhotos] = useState<string[]>([]);
    const [incidentPhoto, setIncidentPhoto] = useState<string>("");
    const isEditMode = !!sessionToEdit;
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm();
    const hasIncident = watch("has_incident");

    useEffect(() => {
        if (isOpen && sessionToEdit) {
            setValue("intervention_plan", sessionToEdit.InterventionPlan);
            setValue("description", sessionToEdit.Description);
            setValue("achievements", sessionToEdit.Achievements);
            setValue("patient_performance", sessionToEdit.PatientPerformance);
            setValue("next_session_notes", sessionToEdit.NextSessionNotes);

            let vitals: any = {};
            if (typeof sessionToEdit.Vitals === 'string') {
                try { vitals = JSON.parse(sessionToEdit.Vitals); } catch (e) { }
            } else {
                vitals = sessionToEdit.Vitals || {};
            }
            setValue("vital_fc", vitals.fc);
            setValue("vital_pa", vitals.pa);
            setValue("vital_sato2", vitals.sato2);
            setValue("vital_pain", vitals.pain);

            let loadedPhotos: string[] = [];
            if (sessionToEdit.Photos) {
                if (Array.isArray(sessionToEdit.Photos)) {
                    loadedPhotos = sessionToEdit.Photos;
                } else if (typeof sessionToEdit.Photos === 'string') {

                    try {
                        const parsed = JSON.parse(sessionToEdit.Photos);
                        if (Array.isArray(parsed)) loadedPhotos = parsed;
                    } catch (e) {
                        console.error("Error parseando fotos:", e);
                    }
                }
            }
            setPhotos(loadedPhotos);

            setValue("has_incident", sessionToEdit.HasIncident);
            setValue("incident_details", sessionToEdit.IncidentDetails);
            setIncidentPhoto(sessionToEdit.IncidentPhoto || "");

        } else if (isOpen && !sessionToEdit) {
            reset();
            setPhotos([]);
            setIncidentPhoto("");
        }
    }, [isOpen, sessionToEdit, setValue, reset]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = {
                patient_id: patientId,
                intervention_plan: data.intervention_plan,
                description: data.description,
                achievements: data.achievements,
                patient_performance: data.patient_performance,
                next_session_notes: data.next_session_notes,

                vitals: {
                    fc: data.vital_fc,
                    pa: data.vital_pa,
                    sato2: data.vital_sato2,
                    pain: data.vital_pain
                },

                photos: photos,

                has_incident: data.has_incident,
                incident_details: data.has_incident ? data.incident_details : "",
                incident_photo: data.has_incident ? incidentPhoto : ""
            };

            if (isEditMode) {
                await endpoints.sessions.update(sessionToEdit.ID, payload);
            } else {
                await endpoints.sessions.create(payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions', patientId] });
            queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
            reset();
            setPhotos([]);
            setIncidentPhoto("");
            onClose();
        }
    });

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isIncident = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = await uploadImage(file, patientId);
        if (url) {
            if (isIncident) {
                setIncidentPhoto(url);
            } else {
                setPhotos(prev => [...prev, url]);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                        {isEditMode ? "Editar Evolución" : "Nueva Evolución Clínica"}
                    </h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form id="session-form" onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

                        {/* 1. Signos Vitales */}
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-3">Signos Vitales (Inicio Sesión)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">FC (lpm)</label>
                                    <input {...register("vital_fc")} type="number" className="w-full mt-1 p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 70" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">PA (mmHg)</label>
                                    <input {...register("vital_pa")} type="text" className="w-full mt-1 p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" placeholder="120/80" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">SatO2 (%)</label>
                                    <input {...register("vital_sato2")} type="number" className="w-full mt-1 p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" placeholder="98" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Dolor (EVA 1-10)</label>
                                    <input {...register("vital_pain")} type="number" max="10" className="w-full mt-1 p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Detalles de la Sesión */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan de Intervención</label>
                                <input {...register("intervention_plan", { required: true })} className="input-field w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Ejercicios de fortalecimiento..." />
                                {errors.intervention_plan && <span className="text-xs text-red-500">Requerido</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción de la Evolución</label>
                                <textarea {...register("description", { required: true })} rows={4} className="input-field w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describa el desarrollo de la sesión..." />
                                {errors.description && <span className="text-xs text-red-500">Requerido</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logros / Avances</label>
                                    <input {...register("achievements")} className="input-field w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Aumentó rango de movimiento" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desempeño Paciente</label>
                                    <select {...register("patient_performance")} className="input-field w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Bueno">Bueno</option>
                                        <option value="Regular">Regular</option>
                                        <option value="Malo">Malo</option>
                                        <option value="No colabora">No colabora</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notas próxima sesión */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indicaciones Próxima Sesión</label>
                                <input {...register("next_session_notes")} className="input-field w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Traer exámenes..." />
                            </div>
                        </div>

                        {/* 3. Evidencia Fotográfica */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Evidencia Fotográfica</label>
                            <div className="flex flex-wrap gap-3">
                                {/* Renderizamos las fotos del estado 'photos' */}
                                {photos.map((url, idx) => (
                                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 group shadow-sm">
                                        <img src={url} className="w-full h-full object-cover" alt="evidencia" />
                                        <button
                                            type="button"
                                            // Al hacer click, filtramos el array quitando esta foto
                                            onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                            title="Eliminar foto"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                {/* Botón Subir */}
                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500" />}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e)} disabled={isUploading} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Puede agregar nuevas fotos o eliminar las existentes.</p>
                        </div>

                        {/* 4. Incidentes */}
                        <div className={`p-4 rounded-xl border transition-all ${hasIncident ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className={`w-5 h-5 ${hasIncident ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                    <span className={`font-semibold ${hasIncident ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'}`}>Reportar Incidente / Evento Adverso</span>
                                </div>
                                <input type="checkbox" {...register("has_incident")} className="w-5 h-5 accent-red-600 cursor-pointer" />
                            </div>

                            {hasIncident && (
                                <div className="space-y-3 mt-3 animate-in slide-in-from-top-2">
                                    <textarea
                                        {...register("incident_details", { required: hasIncident })}
                                        placeholder="Describa detalladamente qué ocurrió..."
                                        className="w-full p-3 border border-red-200 dark:border-red-900/30 rounded-lg focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50 outline-none text-red-900 dark:text-red-100 placeholder:text-red-300 dark:placeholder:text-red-900/50 bg-white dark:bg-slate-800"
                                        rows={3}
                                    />

                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 rounded-lg text-red-700 dark:text-red-300 text-sm cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10">
                                            <Camera className="w-4 h-4" />
                                            {isUploading ? "Subiendo..." : "Adjuntar Foto del Incidente"}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, true)} />
                                        </label>
                                        {incidentPhoto && (
                                            <div className="relative w-16 h-16 rounded overflow-hidden border border-red-200 group">
                                                <img src={incidentPhoto} className="w-full h-full object-cover" alt="Incidente" />
                                                <button type="button" onClick={() => setIncidentPhoto("")} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                    <button
                        form="session-form"
                        type="submit"
                        disabled={mutation.isPending || isUploading}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEditMode ? "Guardar Cambios" : "Guardar Evolución"}
                    </button>
                </div>

            </div>
        </Modal>
    );
}