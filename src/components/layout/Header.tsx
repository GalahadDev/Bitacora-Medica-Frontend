import { useState } from 'react';
import { Bell, LogOut, Search, Menu, Check, X, UserPlus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '../../lib/api';
import { ModeToggle } from '../mode-toggle';
import { cn } from '../../lib/utils';

const formatRut = (rut: string) => {
    if (!rut) return "";

    const cleanRut = rut.replace(/[^0-9kK]/g, "");

    if (cleanRut.length < 2) return cleanRut;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    let formattedBody = "";
    for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
        formattedBody = body.charAt(i) + formattedBody;
        if (j % 3 === 0 && i !== 0) {
            formattedBody = "." + formattedBody;
        }
    }

    return `${formattedBody}-${dv}`;
};

interface HeaderProps {
    toggleMobileSidebar?: () => void;
    isCollapsed: boolean;
}

export default function Header({ toggleMobileSidebar, isCollapsed }: HeaderProps) {
    const { profile, logout } = useAuthStore();
    const queryClient = useQueryClient();
    const [showNotifications, setShowNotifications] = useState(false);

    const { data: invitations = [] } = useQuery({
        queryKey: ['invitations'],
        queryFn: async () => {
            const res = await endpoints.collaborations.getPending();
            return res.data.data;
        },
        refetchInterval: 60000
    });

    const respondMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'ACCEPTED' | 'REJECTED' }) => {
            await endpoints.collaborations.respond(id, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitations'] });
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        }
    });

    const name = profile?.full_name || "Profesional";
    const role = profile?.specialty || "Especialista";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const avatarUrl = profile?.avatar_url;
    const hasNotifications = invitations.length > 0;

    return (
        <header
            className={cn(
                "h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800",
                "flex items-center justify-between px-6 transition-all duration-300 fixed top-0 right-0 z-30",
                "left-0",
                isCollapsed ? "lg:left-20" : "lg:left-64"
            )}
        >

            {/* Izquierda */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleMobileSidebar}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-gray-400"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all dark:text-gray-200" />
                </div>
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-6">

                <ModeToggle />

                {/* --- NOTIFICACIONES --- */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {hasNotifications && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-3 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Notificaciones</h3>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{invitations.length}</span>
                                </div>

                                <div className="max-h-80 overflow-y-auto">
                                    {invitations.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 text-sm">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            No tienes notificaciones nuevas
                                        </div>
                                    ) : (
                                        invitations.map((inv: any) => {
                                            const pInfo = inv.Patient?.PersonalInfo ?
                                                (typeof inv.Patient.PersonalInfo === 'string' ? JSON.parse(inv.Patient.PersonalInfo) : inv.Patient.PersonalInfo)
                                                : {};

                                            return (
                                                <div key={inv.ID} className="p-4 border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                                            <UserPlus className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                                <span className="font-semibold">Invitación a Colaborar</span>
                                                            </p>
                                                            {/* RUT FORMATEADO */}
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                Paciente: {pInfo.first_name} {pInfo.last_name} ({formatRut(pInfo.rut)})
                                                            </p>

                                                            <div className="flex gap-2 mt-3">
                                                                <button
                                                                    onClick={() => respondMutation.mutate({ id: inv.ID, status: 'ACCEPTED' })}
                                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-1"
                                                                >
                                                                    <Check className="w-3 h-3" /> Aceptar
                                                                </button>
                                                                <button
                                                                    onClick={() => respondMutation.mutate({ id: inv.ID, status: 'REJECTED' })}
                                                                    className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs py-1.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-1"
                                                                >
                                                                    <X className="w-3 h-3" /> Rechazar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                {/* Perfil */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">{name}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">{role}</p>
                    </div>

                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-md cursor-pointer group relative">
                        <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-blue-600 font-bold text-sm">{initials}</span>
                            )}
                        </div>

                        <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                            <Link to="/dashboard/settings" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors mb-1">
                                <Settings className="w-4 h-4" /> Configuración
                            </Link>
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    logout();
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}