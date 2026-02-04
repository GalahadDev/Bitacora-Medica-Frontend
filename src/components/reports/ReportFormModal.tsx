import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { X, FileText, Save, Loader2 } from 'lucide-react';
import { endpoints } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import DatePicker from '@/components/ui/DatePicker';

interface ReportFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
}

export default function ReportFormModal({ isOpen, onClose, patientId }: ReportFormModalProps) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            await endpoints.reports.create({
                patient_id: patientId,
                start_date: data.start_date,
                end_date: data.end_date,
                content: data.content,
                objectives: data.objectives
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports', patientId] });
            reset();
            onClose();
        }
    });

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Nuevo Reporte de Progreso</h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                </div>

                {/* Body */}
                <form id="report-form" onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-5 overflow-y-auto">

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <DatePicker
                                label="Desde"
                                value={watch("start_date")}
                                onChange={(date) => setValue("start_date", date)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <DatePicker
                                label="Hasta"
                                value={watch("end_date")}
                                onChange={(date) => setValue("end_date", date)}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Contenido */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Resumen Cualitativo</label>
                        <textarea
                            {...register("content", { required: true })}
                            rows={6}
                            className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none"
                            placeholder="Describa el progreso general del paciente durante este periodo..."
                        />
                        {errors.content && <span className="text-xs text-red-500">Este campo es obligatorio</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Objetivos Logrados / Pendientes</label>
                        <textarea
                            {...register("objectives")}
                            rows={4}
                            className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none"
                            placeholder="Listado de hitos alcanzados o dificultades encontradas..."
                        />
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                        <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>Al guardar, este reporte quedará disponible para generar el consolidado maestro y podrá ser descargado como PDF.</p>
                    </div>

                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl bg-gray-50/50 dark:bg-slate-800/50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-sm">Cancelar</button>
                    <button
                        form="report-form"
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 text-sm"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Reporte
                    </button>
                </div>
            </div>
        </Modal>
    );
}