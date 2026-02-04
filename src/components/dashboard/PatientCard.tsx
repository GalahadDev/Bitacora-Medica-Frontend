import { FileText, MoreVertical, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import type { PatientUI } from "../../types";

interface PatientCardProps {
    patient: PatientUI;
}

const statusConfig = {
    active: {
        label: "Activo",
        className: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30",
    },
    pending: {
        label: "Pendiente",
        className: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30",
    },
};

const PatientCard = ({ patient }: PatientCardProps) => {
    const status = statusConfig[patient.status] || statusConfig.active;
    const initials = patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-white/20 dark:border-slate-800 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold ring-2 ring-blue-100 dark:ring-blue-900/30">
                        {initials}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {patient.age} años
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                        {status.label}
                    </span>
                    {/* Aquí iría el DropdownMenu si usas shadcn/ui */}
                    <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
                    <span className="font-medium text-gray-700 dark:text-gray-200">Diagnóstico:</span>{" "}
                    {patient.diagnosis || "Sin diagnóstico registrado"}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 dark:text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Última visita: {patient.lastVisit}</span>
                    </div>
                </div>

                <Link
                    to={`/dashboard/patients/${patient.id}`}
                    className="mt-4 block w-full text-center py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                    Ver Ficha
                </Link>
            </div>
        </div>
    );
};

export default PatientCard;