import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { endpoints } from '@/lib/api';
import Modal from '@/components/ui/Modal';

export default function PatientList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [patientToDelete, setPatientToDelete] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: patients = [], isLoading } = useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            const res = await endpoints.patients.list();
            return res.data.data || [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            console.log("Simulando eliminación de", id);
            await new Promise(r => setTimeout(r, 1000));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            setPatientToDelete(null);
        }
    });

    const filteredPatients = patients.filter((p: any) => {
        const fullName = `${p.PersonalInfo?.first_name} ${p.PersonalInfo?.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || p.PersonalInfo?.rut.includes(searchTerm);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pacientes</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Directorio de expedientes médicos</p>
                </div>
                <Link
                    to="/dashboard/patients/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Paciente
                </Link>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o RUT..."
                    className="flex-1 outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-semibold border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4 hidden sm:table-cell">RUT</th>
                                <th className="px-6 py-4 hidden md:table-cell">Diagnóstico</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Contacto</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center">Cargando...</td></tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No se encontraron pacientes</td></tr>
                            ) : (
                                filteredPatients.map((p: any) => (
                                    <tr key={p.ID} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                                    {p.PersonalInfo?.first_name[0]}{p.PersonalInfo?.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{p.PersonalInfo?.first_name} {p.PersonalInfo?.last_name}</p>
                                                    <p className="text-xs text-gray-400">ID: {p.ID.slice(0, 8)}...</p>
                                                    {/* Mobile Only Info */}
                                                    <div className="sm:hidden text-xs text-gray-500 mt-0.5">
                                                        {p.PersonalInfo?.rut}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">{p.PersonalInfo?.rut}</td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md text-xs font-medium border border-yellow-100 dark:border-yellow-900/30">
                                                {p.PersonalInfo?.diagnosis || "Sin Diagnóstico"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">{p.PersonalInfo?.phone || "-"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/dashboard/patients/${p.ID}`}
                                                className="inline-flex p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Ver Expediente"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => setPatientToDelete(p)}
                                                className="inline-flex p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                                                title="Eliminar Paciente"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!patientToDelete} onClose={() => setPatientToDelete(null)}>
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">¿Eliminar Paciente?</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Estás a punto de eliminar a <span className="font-semibold text-gray-900 dark:text-gray-200">{patientToDelete?.PersonalInfo?.first_name} {patientToDelete?.PersonalInfo?.last_name}</span>.
                            Esta acción no se puede deshacer y se perderán todos los datos asociados.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setPatientToDelete(null)}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(patientToDelete.ID)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors flex items-center justify-center gap-2"
                            >
                                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}