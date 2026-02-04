import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-background font-sans transition-colors duration-300">

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* 1. Sidebar Fijo */}
            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                closeMobileSidebar={() => setIsMobileOpen(false)}
            />

            {/* 2. Header Fijo */}
            <Header
                isCollapsed={isCollapsed}
                toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
            />

            {/* 3. Contenido Principal */}
            <main
                className={cn(
                    "transition-all duration-300 min-h-screen",
                    "ml-0 lg:ml-64",
                    isCollapsed && "lg:ml-20",
                    "pt-[calc(6rem+env(safe-area-inset-top))] px-4 sm:px-6 pb-10"
                )}
            >
                <div className="container mx-auto max-w-7xl animate-fade-up">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}