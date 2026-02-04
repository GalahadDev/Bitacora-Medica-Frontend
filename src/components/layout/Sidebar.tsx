import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    ShieldCheck,
    LifeBuoy,
    X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobileOpen?: boolean;
    closeMobileSidebar?: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar, isMobileOpen = false, closeMobileSidebar }: SidebarProps) {
    const { user, profile, logout } = useAuthStore();

    const name = profile?.full_name || "Usuario";
    const role = profile?.specialty || "Sin cargo";
    const avatarUrl = profile?.avatar_url;
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const isAdmin = user?.role === 'ADMIN';
    const showExpanded = !isCollapsed || isMobileOpen;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard', end: true },
        { icon: Users, label: 'Pacientes', to: '/dashboard/patients' },
        { icon: FileText, label: 'Reportes', to: '/dashboard/reports' },
    ];

    if (isAdmin) {
        navItems.push({ icon: ShieldCheck, label: 'Panel Admin', to: '/dashboard/admin' });
    }

    navItems.push({ icon: Settings, label: 'Configuración', to: '/dashboard/settings' }, { icon: LifeBuoy, label: 'Soporte', to: '/dashboard/support' });

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-sm",
                "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
                "transition-all duration-300 ease-in-out",
                "w-64 transform",
                isMobileOpen ? "translate-x-0" : "-translate-x-full",
                "lg:translate-x-0",
                isCollapsed ? "lg:w-20" : "lg:w-64"
            )}
        >
            {/* Header Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-50 dark:border-slate-800">
                <div className={cn("flex items-center gap-3 overflow-hidden transition-all", !showExpanded && "justify-center w-full")}>
                    <img src="/logo.png" alt="MedLog" className="w-12 h-12 object-contain" />
                    {showExpanded && (
                        <div className="animate-fade-in">
                            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-none tracking-tight">MedLog</h1>
                        </div>
                    )}
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={closeMobileSidebar}
                    className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Desktop Collapse Button */}
                {!isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:block p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => closeMobileSidebar?.()}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                            isActive
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200",
                            !showExpanded && "lg:justify-center"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
                                {showExpanded && <span>{item.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer: Perfil en Sidebar */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">

                <div className={cn("flex items-center gap-3 mb-4", !showExpanded && "justify-center")}>
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-gray-700">{initials}</span>
                            )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    {showExpanded && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{role}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        logout();
                    }}
                    className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium",
                        !showExpanded && "justify-center"
                    )}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {showExpanded && <span>Cerrar Sesión</span>}
                </button>

                {/* Only show expand button if strictly collapsed */}
                {isCollapsed && !isMobileOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="mt-2 w-full flex justify-center p-2 hover:bg-gray-200 rounded-lg text-gray-400 hidden lg:flex"
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                )}
            </div>
        </aside>
    );
}