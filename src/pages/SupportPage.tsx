import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { Plus, Search, Clock, CheckCircle2, Inbox } from 'lucide-react';
import CreateTicketModal from '@/components/support/CreateTicketModal';
import TicketDetailModal from '@/components/support/TicketDetailModal';
import { useAuthStore } from '@/store/auth';

export default function SupportPage() {
    const { user } = useAuthStore();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [filter, setFilter] = useState("");

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['tickets'],
        queryFn: async () => {
            const res = await endpoints.support.list();
            return res.data.data || [];
        }
    });

    const filteredTickets = tickets.filter((t: any) =>
        t.Subject.toLowerCase().includes(filter.toLowerCase()) ||
        t.Status.toLowerCase().includes(filter.toLowerCase())
    );

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Centro de Soporte</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isAdmin ? "Gestiona las solicitudes de los usuarios." : "¿Necesitas ayuda? Abre un ticket y te responderemos."}
                    </p>
                </div>
                {!isAdmin && (
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Ticket
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar tickets..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">Cargando tickets...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center text-gray-400 dark:text-gray-500">
                        <Inbox className="w-12 h-12 mb-3 opacity-20" />
                        <p>No hay tickets para mostrar.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-slate-800">
                        {filteredTickets.map((ticket: any) => {
                            const isClosed = ticket.Status === 'CLOSED';
                            return (
                                <div
                                    key={ticket.ID}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {ticket.Subject}
                                        </h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${isClosed ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400'}`}>
                                            {isClosed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {isClosed ? 'Cerrado' : 'Abierto'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{ticket.Message}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>{new Date(ticket.CreatedAt).toLocaleDateString()}</span>
                                        {isAdmin && ticket.User && (
                                            <span className="text-indigo-400 font-medium">De: {ticket.User.Email}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modales */}
            <CreateTicketModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />

            <TicketDetailModal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                ticket={selectedTicket}
            />
        </div>
    );
}