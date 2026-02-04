import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "./theme-provider"
import { useState } from "react"
import { cn } from "../lib/utils"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const toggleDropdown = () => setIsOpen(!isOpen)

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
                title="Cambiar tema"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute top-2 left-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Cambiar tema</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-12 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-1">
                            <button
                                onClick={() => { setTheme("light"); setIsOpen(false) }}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                                    theme === 'light' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <Sun className="w-4 h-4" />
                                <span>Claro</span>
                            </button>
                            <button
                                onClick={() => { setTheme("dark"); setIsOpen(false) }}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                                    theme === 'dark' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <Moon className="w-4 h-4" />
                                <span>Oscuro</span>
                            </button>
                            <button
                                onClick={() => { setTheme("system"); setIsOpen(false) }}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                                    theme === 'system' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <Monitor className="w-4 h-4" />
                                <span>Sistema</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
