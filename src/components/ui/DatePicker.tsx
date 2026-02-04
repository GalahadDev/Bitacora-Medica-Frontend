import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    isToday,
    setYear,
    setMonth,
    getYear,
    getMonth,
    isValid,
    parseISO,
    startOfDay,
    endOfDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DatePickerProps {
    value: Date | string | null;
    onChange: (date: string) => void; // Returns ISO string YYYY-MM-DD
    label?: string;
    error?: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
    placeholder?: string;
}

export default function DatePicker({
    value,
    onChange,
    label,
    error,
    className,
    minDate,
    maxDate,
    placeholder = "Seleccionar fecha"
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    const parseValue = (val: Date | string | null): Date | null => {
        if (!val) return null;
        if (val instanceof Date) return isValid(val) ? val : null;
        const parsed = parseISO(val);
        return isValid(parsed) ? parsed : null;
    };

    const selectedDate = parseValue(value);
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

    useEffect(() => {
        if (selectedDate && !isSameMonth(selectedDate, currentMonth)) {
            setCurrentMonth(selectedDate);
        }
    }, [value]);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX
            });
        } else {
            setCoords(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const clickedInsideContainer = containerRef.current?.contains(target);
            const clickedInsidePopup = popupRef.current?.contains(target);

            if (!clickedInsideContainer && !clickedInsidePopup) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value);
        setCurrentMonth(setYear(currentMonth, newYear));
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value);
        setCurrentMonth(setMonth(currentMonth, newMonth));
    };

    const handleDateClick = (day: Date) => {
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const clearDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    const renderHeader = () => {
        const years = Array.from({ length: 100 }, (_, i) => getYear(new Date()) - 80 + i); // Last 80 years + 20 future
        const months = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        return (
            <div className="flex items-center justify-between mb-4 px-1">
                <button onClick={prevMonth} type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                    <select
                        value={getMonth(currentMonth)}
                        onChange={handleMonthChange}
                        className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none hover:text-blue-600 dark:hover:text-blue-400 appearance-none text-center"
                    >
                        {months.map((m, i) => <option key={m} value={i} className="bg-white dark:bg-slate-800">{m}</option>)}
                    </select>

                    <select
                        value={getYear(currentMonth)}
                        onChange={handleYearChange}
                        className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none hover:text-blue-600 dark:hover:text-blue-400 appearance-none"
                    >
                        {years.map(y => <option key={y} value={y} className="bg-white dark:bg-slate-800">{y}</option>)}
                    </select>
                </div>

                <button onClick={nextMonth} type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                const isBeforeMin = minDate ? day < startOfDay(minDate) : false;
                const isAfterMax = maxDate ? day > endOfDay(maxDate) : false;
                const isDisabled = isBeforeMin || isAfterMax;

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "relative w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200 border-2 border-transparent",
                            isDisabled ? "text-gray-300 dark:text-slate-700 cursor-not-allowed bg-gray-50 dark:bg-slate-900/50" : "cursor-pointer",
                            !isCurrentMonth && !isDisabled ? "text-gray-300 dark:text-slate-600" : "",
                            isCurrentMonth && !isDisabled ? "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-300" : "",
                            isSelected && !isDisabled && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:bg-blue-600 dark:text-white shadow-md shadow-blue-500/20",
                            isTodayDate && !isSelected && !isDisabled && "border-blue-200 dark:border-blue-900 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                        )}
                        onClick={() => !isDisabled && handleDateClick(cloneDay)}
                    >
                        {formattedDate}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1 mb-1" key={day.toISOString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="mb-2">{rows}</div>;
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {label && (
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 mb-1 uppercase tracking-wide block">
                    {label}
                </label>
            )}

            <div
                className={cn(
                    "flex items-center w-full px-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl cursor-pointer transition-all duration-200",
                    isOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600",
                    error ? "border-red-500 focus:ring-red-500/20" : ""
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <CalendarIcon className={cn("w-4 h-4 mr-3", selectedDate ? "text-blue-500" : "text-gray-400")} />

                <span className={cn("flex-1 text-sm truncate", !selectedDate && "text-gray-400 dark:text-gray-500")}>
                    {selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es }) : placeholder}
                </span>

                {selectedDate && (
                    <div
                        onClick={clearDate}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}

            {/* Popup Calendar */}
            {isOpen && coords && createPortal(
                <div
                    ref={popupRef}
                    style={{ top: coords.top, left: coords.left }}
                    className="absolute z-[9999] p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-72 sm:w-[300px] max-w-[95vw] animate-in fade-in zoom-in-95 duration-200"
                >
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                onChange(format(today, 'yyyy-MM-dd'));
                                setIsOpen(false);
                            }}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
                        >
                            Seleccionar Hoy
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
