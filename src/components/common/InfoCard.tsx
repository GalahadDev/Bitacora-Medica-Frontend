import * as React from "react"
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/Card"

interface InfoItem {
    icon?: LucideIcon
    label: string
    value: string | React.ReactNode
    iconColorClass?: string
    iconBgClass?: string
}

interface InfoCardProps {
    title: string
    items: InfoItem[]
    badgeCouunt?: number
    footerAction?: React.ReactNode
}

export function InfoCard({ title, items, badgeCouunt, footerAction }: InfoCardProps) {
    return (
        <Card>
            <div className="p-6 pb-2 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-xl">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                {badgeCouunt !== undefined && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{badgeCouunt}</span>
                )}
            </div>
            <CardContent className="pt-4 space-y-4">
                {items.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Sin información disponible</p>
                ) : (
                    <ul className="space-y-4">
                        {items.map((item, index) => (
                            <li key={index} className="flex gap-3">
                                {item.icon && (
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.iconBgClass || 'bg-gray-50'}`}>
                                        <item.icon className={`w-4 h-4 ${item.iconColorClass || 'text-gray-600'}`} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {footerAction && (
                    <div className="mt-4 pt-2">
                        {footerAction}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
