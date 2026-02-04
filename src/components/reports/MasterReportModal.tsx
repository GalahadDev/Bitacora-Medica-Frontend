import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, FileBarChart, Loader2, Printer } from 'lucide-react';
import { endpoints } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import DatePicker from '@/components/ui/DatePicker';


interface MasterReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
}

export default function MasterReportModal({ isOpen, onClose, patientId, patientName }: MasterReportModalProps) {
    const { handleSubmit, setValue, watch } = useForm();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const handleGenerate = async (data: any) => {
        setLoading(true);
        try {
            const res = await endpoints.reports.getMaster(patientId, data.start_date, data.end_date);
            setReportData(res.data.data);
        } catch (error) {
            console.error("Error generating master report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!reportData) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Informe Maestro - ${patientName}</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; max-width: 900px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
                    .header h1 { margin: 0; color: #111827; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
                    .header p { color: #6b7280; margin-top: 5px; }
                    
                    .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                    .kpi-card { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
                    .kpi-val { font-size: 32px; font-weight: bold; color: #3b82f6; }
                    .kpi-label { font-size: 14px; text-transform: uppercase; color: #4b5563; font-weight: 600; }

                    .section { margin-bottom: 35px; page-break-inside: avoid; }
                    .section-title { font-size: 18px; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 15px; background: #eff6ff; padding: 10px; font-weight: bold; }
                    
                    .pro-summary { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px dashed #e5e7eb; }
                    .pro-header { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: baseline; }
                    .pro-name { font-weight: bold; font-size: 16px; color: #111827; }
                    .pro-role { font-size: 14px; color: #3b82f6; background: #eff6ff; padding: 2px 8px; border-radius: 4px; }
                    .pro-content { text-align: justify; line-height: 1.6; font-size: 14px; white-space: pre-wrap; }
                    
                    .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Informe de Progreso Consolidado</h1>
                    <p>Paciente: <strong>${patientName}</strong></p>
                    <p>Periodo: ${reportData.date_range}</p>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-val">${reportData.total_sessions}</div>
                        <div class="kpi-label">Sesiones Realizadas</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-val" style="color: ${reportData.total_incidents > 0 ? '#ef4444' : '#10b981'}">
                            ${reportData.total_incidents}
                        </div>
                        <div class="kpi-label">Incidentes Reportados</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Evaluación Multidisciplinaria</div>
                    ${reportData.professional_summaries && reportData.professional_summaries.length > 0
                ? reportData.professional_summaries.map((s: any) => `
                            <div class="pro-summary">
                                <div class="pro-header">
                                    <span class="pro-name">${s.professional_name}</span>
                                    <span class="pro-role">${s.role || 'Especialista'}</span>
                                </div>
                                <div class="pro-content">
                                    <p><strong>Resumen Clínico:</strong><br/>${s.summary}</p>
                                    ${s.objectives ? `<p style="margin-top:10px;"><strong>Objetivos:</strong><br/>${s.objectives}</p>` : ''}
                                </div>
                            </div>
                        `).join('')
                : '<p style="text-align:center; color:#999;">No se encontraron reportes individuales en este rango de fechas.</p>'
            }
                </div>

                <div class="footer">
                    Generado el ${new Date().toLocaleDateString()} mediante MedLog Platform.
                </div>
                <script>window.onload = () => window.print();</script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <FileBarChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Generar Reporte Maestro</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Consolidado de métricas y opiniones del equipo</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">

                    {/* Formulario de Selección */}
                    {!reportData ? (
                        <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300 mb-4 border border-blue-100 dark:border-blue-900/30">
                                Seleccione un rango de fechas. El sistema buscará todas las sesiones y reportes individuales creados en ese periodo para generar un documento unificado.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <DatePicker
                                        label="Fecha Inicio"
                                        value={watch("start_date")}
                                        onChange={(date) => setValue("start_date", date)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <DatePicker
                                        label="Fecha Fin"
                                        value={watch("end_date")}
                                        onChange={(date) => setValue("end_date", date)}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileBarChart className="w-4 h-4" />}
                                    Analizar y Generar
                                </button>
                            </div>
                        </form>
                    ) : (

                        <div className="space-y-6 animate-in slide-in-from-bottom-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Sesiones</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{reportData.total_sessions}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Incidentes</p>
                                    <p className={`text-3xl font-bold ${reportData.total_incidents > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {reportData.total_incidents}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Resúmenes Incluidos ({reportData.professional_summaries?.length || 0})</h4>
                                <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                    {reportData.professional_summaries?.map((s: any, i: number) => (
                                        <li key={i} className="text-sm p-2 bg-gray-50 dark:bg-slate-800 rounded flex justify-between border border-transparent dark:border-slate-700">
                                            <span className="font-medium text-gray-700 dark:text-gray-200">{s.professional_name}</span>
                                            <span className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-300">{s.role}</span>
                                        </li>
                                    ))}
                                    {(!reportData.professional_summaries || reportData.professional_summaries.length === 0) && (
                                        <li className="text-sm text-gray-400 italic">No se encontraron reportes cualitativos en este rango.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800">
                                <button
                                    onClick={() => setReportData(null)}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium"
                                >
                                    ← Volver atrás
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg shadow-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Imprimir Informe Oficial
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}