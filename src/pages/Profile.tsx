import { useAuthStore } from '@/store/auth';
import { User, Mail, Shield, Stethoscope, Phone, MapPin, Calendar, GraduationCap, Fingerprint, Flag, Book } from 'lucide-react';
import { formatDateUTC } from '@/lib/utils';

export default function Profile() {
    const { user, profile } = useAuthStore();

    if (!profile) {
        return <div className="p-10 text-center text-gray-500">Cargando perfil...</div>;
    }

    const initials = profile.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "US";

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
                <p className="text-gray-500 dark:text-gray-400">Gestiona tu información personal y profesional.</p>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 shadow-xl">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">{initials}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center md:text-left space-y-2 flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.full_name}</h2>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-500 dark:text-gray-400 text-sm justify-center md:justify-start">
                        <span className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4" />
                            {user?.email}
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-blue-500" />
                            {user?.role === 'ADMIN' ? 'Administrador' : 'Profesional'}
                        </span>
                    </div>
                    {profile.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl italic mt-2">
                            "{profile.bio}"
                        </p>
                    )}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Information Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden h-full">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Información Personal</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* RUT */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-1">
                                    <Fingerprint className="w-3 h-3" /> RUT
                                </label>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{profile.rut || "-"}</p>
                            </div>

                            {/* Fecha Nacimiento */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-1">
                                    <Calendar className="w-3 h-3" /> Fecha Nacimiento
                                </label>
                                <p className="text-gray-900 dark:text-gray-200 font-medium whitespace-capitalize">
                                    {profile.birth_date ? formatDateUTC(profile.birth_date, { dateStyle: 'long' }) : "-"}
                                </p>
                            </div>

                            {/* Género */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-1">
                                    <User className="w-3 h-3" /> Género
                                </label>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{profile.gender || "-"}</p>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-1">
                                    <Phone className="w-3 h-3" /> Teléfono
                                </label>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{profile.phone || "No registrado"}</p>
                            </div>

                            {/* Nacionalidad */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-1">
                                    <Flag className="w-3 h-3" /> Nacionalidad
                                </label>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{profile.nationality || "-"}</p>
                            </div>

                            {/* Residencia */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-1">
                                    <MapPin className="w-3 h-3" /> Residencia
                                </label>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{profile.residence_country || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Info Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Información Profesional</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">

                        {/* Especialidad */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-2">
                                <Stethoscope className="w-3 h-3" /> Especialidad
                            </label>
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                                {profile.specialty || "General"}
                            </span>
                        </div>

                        {/* Universidad */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-1">
                                <GraduationCap className="w-3 h-3" /> Universidad de Egreso
                            </label>
                            <p className="text-gray-900 dark:text-gray-200 font-medium">{profile.university || "-"}</p>
                        </div>

                        {/* Registro */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase mb-1">
                                <Book className="w-3 h-3" /> Fecha de Registro
                            </label>
                            <p className="text-gray-900 dark:text-gray-200 font-medium">
                                {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20">
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                            Para modificar esta información, por favor contacta al administrador del sistema.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
