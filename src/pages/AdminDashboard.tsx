import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
    Users, UserCheck, Activity, Briefcase, Search, Check, X, Loader2, ShieldCheck, BarChart as BarChartIcon
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, YAxis
} from 'recharts';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const { data: dashboardData } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await endpoints.admin.getDashboard();
            return res.data;
        }
    });

    const { data: pendingUsers = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['admin-pending-users'],
        queryFn: async () => {
            const res = await endpoints.admin.getPendingUsers();
            return res.data.data || [];
        }
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'APPROVED' | 'REJECTED' }) => {
            await endpoints.admin.reviewUser(id, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
    });

    const stats = dashboardData?.stats || {};
    const growthData = Array.isArray(dashboardData?.growth) ? dashboardData.growth : [];
    const filteredUsers = pendingUsers.filter((u: any) =>
        u.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-in fade-in duration-500">

            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de Administración</h1>
                    <p className="text-gray-500 dark:text-gray-400">Visión global y control de acceso.</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Usuarios" value={stats.total_users || 0} icon={<Users className="w-5 h-5 text-white" />} color="bg-blue-600" />
                <StatCard title="Pendientes" value={stats.pending_users || 0} icon={<UserCheck className="w-5 h-5 text-white" />} color="bg-amber-500" />
                <StatCard title="Pacientes Activos" value={stats.active_patients || 0} icon={<Activity className="w-5 h-5 text-white" />} color="bg-emerald-500" />
                <StatCard title="Total Sesiones" value={stats.total_sessions || 0} icon={<Briefcase className="w-5 h-5 text-white" />} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* GRÁFICO DE CRECIMIENTO */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Nuevos Registros (Año Actual)</h3>
                    <div className="flex-1 min-h-[250px] w-full">
                        {growthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--tooltip-border, #e5e7eb)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-text, #374151)' }}
                                        itemStyle={{ color: 'var(--tooltip-text, #374151)' }}
                                    />
                                    <Bar dataKey="usuarios" radius={[4, 4, 0, 0]}>
                                        {growthData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index === growthData.length - 1 ? '#2563eb' : '#93c5fd'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm italic bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                                <BarChartIcon className="w-8 h-8 mb-2 opacity-20" />
                                <p>Sin datos de crecimiento aún.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* TABLA DE USUARIOS */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Solicitudes Pendientes</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Profesionales esperando validación.</p>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Profesional</th>
                                    <th className="px-6 py-4 font-semibold">Especialidad</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                {loadingUsers ? (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan={3} className="p-12 text-center text-gray-400">¡Todo listo! No hay solicitudes pendientes.</td></tr>
                                ) : (
                                    filteredUsers.map((u: any) => {
                                        let profile: any = {};
                                        try { profile = typeof u.ProfileData === 'string' ? JSON.parse(u.ProfileData) : u.ProfileData; } catch (e) { }
                                        const name = profile?.full_name || "Sin Nombre";

                                        return (
                                            <tr key={u.ID} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">
                                                            {u.Email.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{u.Email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                        {profile?.specialty || "General"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => reviewMutation.mutate({ id: u.ID, status: 'REJECTED' })}
                                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-lg transition-colors"
                                                            title="Rechazar"
                                                            disabled={reviewMutation.isPending}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => reviewMutation.mutate({ id: u.ID, status: 'APPROVED' })}
                                                            className="p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors flex items-center gap-2"
                                                            title="Aprobar"
                                                            disabled={reviewMutation.isPending}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span className="text-xs font-bold">Aprobar</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shadow-lg shadow-${color.split('-')[1]}-500/30`}>
                {icon}
            </div>
        </div>
    );
}