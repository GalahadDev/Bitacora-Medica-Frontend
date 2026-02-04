import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { FileText, Loader2, Eye, Printer, Calendar } from 'lucide-react';
import { formatDateUTC } from '@/lib/utils';
import DocumentViewerModal from '@/components/ui/DocumentViewerModal';
import { useState } from 'react';
import DatePicker from '@/components/ui/DatePicker';

export default function PatientReportsList({ patientId }: { patientId: string }) {
    const [reportToView, setReportToView] = useState<{ title: string, content: string } | null>(null);
    const [dateFilter, setDateFilter] = useState('');

    const { data: reports = [], isLoading } = useQuery({
        queryKey: ['reports', patientId],
        queryFn: async () => {
            const res = await endpoints.reports.list(patientId);
            return res.data.data || [];
        }
    });

    const filteredReports = reports.filter((report: any) => {
        if (!dateFilter) return true;
        return report.DateRangeStart.startsWith(dateFilter);
    });

    const generateReportHtml = (report: any) => {
        const start = formatDateUTC(report.DateRangeStart);
        const end = formatDateUTC(report.DateRangeEnd);
        let authorName = report.Author?.Email || "Profesional";

        if (report.Author?.ProfileData) {
            try {
                const pData = typeof report.Author.ProfileData === 'string'
                    ? JSON.parse(report.Author.ProfileData)
                    : report.Author.ProfileData;
                authorName = pData.full_name || pData.name || authorName;
            } catch (e) { }
        }

        return `
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; line-height: 1.6; max-width: 100%; margin: 0 auto; background: white; }
                    .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: end; }
                    .header-info h1 { margin: 0; color: #1e40af; font-size: 24px; }
                    .meta { color: #666; font-size: 0.9em; margin-top: 5px; }
                    .section { margin-bottom: 30px; }
                    .section h3 { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; color: #111827; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .content { white-space: pre-wrap; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #f3f4f6; font-size: 14px; text-align: justify; }
                    .footer { margin-top: 60px; font-size: 0.75em; color: #9ca3af; text-align: center; border-top: 1px solid #eee; padding-top: 20px;}
                    .logo-box { font-weight: bold; color: #4b5563; border: 1px solid #e5e7eb; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
                </style>
            </head>
            <body>
                 <div class="header">
                    <div class="header-info">
                        <h1>Reporte de Progreso Clínico</h1>
                        <div class="meta">
                            <div><strong>Profesional:</strong> ${authorName}</div>
                            <div><strong>Periodo:</strong> ${start} - ${end}</div>
                        </div>
                    </div>
                    <div class="logo-box">MedLog Digital</div>
                </div>

                <div class="section">
                    <h3>Resumen Cualitativo</h3>
                    <div class="content">${report.Content}</div>
                </div>

                <div class="section">
                    <h3>Objetivos y Logros</h3>
                    <div class="content">${report.ObjectivesAchieved || 'No se registraron objetivos específicos para este periodo.'}</div>
                </div>

                <div class="footer">
                    Documento generado electrónicamente el ${new Date().toLocaleDateString()}
                </div>
            </body>
            </html>
        `;
    };

    const handlePrint = (report: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const html = generateReportHtml(report);
        const printHtml = html.replace('</body>', '<script>window.onload = function() { window.print(); }</script></body>');
        printWindow.document.write(printHtml);
        printWindow.document.close();
    };

    const handleView = (report: any) => {
        const html = generateReportHtml(report);
        setReportToView({
            title: `Reporte ${formatDateUTC(report.DateRangeStart)}`,
            content: html
        });
    };

    if (isLoading) return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>;

    return (
        <div className="animate-in fade-in duration-500">
            {/* Filter */}
            <div className="flex justify-end mb-4">
                <div className="relative">
                    <DatePicker
                        value={dateFilter}
                        onChange={(date) => setDateFilter(date)} // DatePicker returns YYYY-MM-DD
                        placeholder="Filtrar por fecha exacta"
                        className="w-full"
                    />
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="p-10 text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                    No hay reportes generados aún.
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="p-10 text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                    No se encontraron reportes para la fecha seleccionada.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredReports.map((report: any) => {
                        const start = formatDateUTC(report.DateRangeStart, {});
                        const end = formatDateUTC(report.DateRangeEnd, {});

                        let authorName = "Profesional";
                        if (report.Author?.ProfileData) {
                            try {
                                const pData = typeof report.Author.ProfileData === 'string'
                                    ? JSON.parse(report.Author.ProfileData)
                                    : report.Author.ProfileData;
                                authorName = pData.full_name || pData.name || report.Author.Email;
                            } catch (e) { }
                        } else if (report.Author?.Email) {
                            authorName = report.Author.Email;
                        }

                        return (
                            <div key={report.ID} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all group">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg h-fit group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{authorName}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{start} - {end}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-1 italic">
                                            "{report.Content.substring(0, 60)}..."
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 shrink-0 flex-col sm:flex-row">
                                    <button
                                        onClick={() => handleView(report)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => handlePrint(report)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 transition-all"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Imprimir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <DocumentViewerModal
                isOpen={!!reportToView}
                onClose={() => setReportToView(null)}
                title={reportToView?.title || "Reporte"}
                content={reportToView?.content}
            />
        </div>
    );
}