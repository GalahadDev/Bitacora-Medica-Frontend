import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
    Users, Activity, ArrowUpRight, AlertCircle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import PatientCard from '@/components/dashboard/PatientCard';

export default function Dashboard() {
    const { profile } = useAuthStore();
    const navigate = useNavigate();

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const res = await endpoints.dashboard.getSummary();
            return res.data;
        }
    });

    const stats = dashboardData?.stats || { active_patients: 0, monthly_sessions: 0, reported_incidents: 0 };
    const activityData = dashboardData?.activity || [];
    const recentPatients = dashboardData?.recent_patients || [];
    const professionalName = profile?.full_name || "Colega";

    if (isLoading) {
        return <div className="p-10 text-center text-gray-400">Cargando tu resumen...</div>;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-in fade-in duration-500">

            {/* 1. Header con Nombre Real */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Hola, {professionalName} 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Resumen de tu actividad clínica en tiempo real.</p>
                </div>
                <div className="text-sm text-gray-400 hidden sm:block">
                    {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* 2. KPIs (Indicadores) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                    title="Pacientes Activos"
                    value={stats.active_patients}
                    subtext="Total asignados"
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    color="blue"
                />
                <KpiCard
                    title="Sesiones este Mes"
                    value={stats.monthly_sessions}
                    subtext="Evoluciones registradas"
                    icon={<Activity className="w-5 h-5 text-purple-600" />}
                    color="purple"
                    trend="up"
                />
                <KpiCard
                    title="Incidentes Históricos"
                    value={stats.reported_incidents}
                    subtext="Eventos adversos"
                    icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
                    color="amber"
                />
            </div>

            {/* 3. Gráfico de Actividad */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Actividad Semanal</h3>
                </div>
                <div className="h-[300px] w-full">
                    {activityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: '8px', border: '1px solid var(--tooltip-border, #e5e7eb)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: 'var(--tooltip-text, #374151)' }}
                                    itemStyle={{ color: 'var(--tooltip-text, #374151)' }}
                                    cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sesiones"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSesiones)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm bg-gray-50/50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                            <Activity className="w-8 h-8 mb-2 opacity-20" />
                            <p>No hay actividad registrada en los últimos 7 días.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Lista de Pacientes */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pacientes Recientes</h2>
                    <button
                        onClick={() => navigate('/dashboard/patients')}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline"
                    >
                        Ver todos
                    </button>
                </div>

                {recentPatients.length === 0 ? (
                    <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm text-gray-500 dark:text-gray-400">
                        No has atendido pacientes recientemente.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentPatients.map((patient: any) => (
                            <PatientCard
                                key={patient.ID}
                                patient={{
                                    id: patient.ID,
                                    name: `${patient.PersonalInfo?.first_name || ''} ${patient.PersonalInfo?.last_name || ''}`,
                                    age: patient.PersonalInfo?.age || 0,
                                    gender: patient.PersonalInfo?.sex || 'No especificado',
                                    phone: patient.PersonalInfo?.phone || '',
                                    lastVisit: new Date(patient.UpdatedAt || patient.CreatedAt).toLocaleDateString(),
                                    status: 'active',
                                    diagnosis: patient.DisabilityReport || patient.PersonalInfo?.diagnosis || 'Sin diagnóstico',
                                    avatar: ''
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function KpiCard({ title, value, subtext, icon, color = "blue", trend }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Activo
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>
            </div>
        </div>
    );
}