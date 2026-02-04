import { Users, Activity, CalendarCheck, AlertCircle } from "lucide-react";

export default function DashboardStats() {
    const stats = [
        { label: "Pacientes Totales", value: "24", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Sesiones este mes", value: "12", icon: Activity, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { label: "Citas Pendientes", value: "3", icon: CalendarCheck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
        { label: "Incidentes", value: "1", icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</h4>
                    </div>
                </div>
            ))}
        </div>
    );
}