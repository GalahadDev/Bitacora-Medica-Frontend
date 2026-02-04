import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { endpoints } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Modal from '@/components/ui/Modal';

interface TicketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: any;
}

export default function TicketDetailModal({ isOpen, onClose, ticket }: TicketDetailModalProps) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [reply, setReply] = useState("");

    const replyMutation = useMutation({
        mutationFn: async () => {
            await endpoints.support.reply(ticket.ID, reply);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
            setReply("");
        }
    });

    if (!isOpen || !ticket) return null;

    const isAdmin = user?.role === 'ADMIN';
    const isClosed = ticket.Status === 'CLOSED';

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-gray-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{ticket.Subject}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className={`px-2 py-0.5 rounded-full font-medium border ${isClosed ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400' : 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400'}`}>
                                {isClosed ? 'Cerrado' : 'Abierto'}
                            </span>
                            <span>• {new Date(ticket.CreatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Mensaje Original */}
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700">
                                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{ticket.Message}</p>
                            </div>
                            {isAdmin && ticket.User && (
                                <p className="text-xs text-gray-400 mt-1 ml-2">
                                    Enviado por: {ticket.User.Email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Respuesta Admin (Si existe) */}
                    {ticket.AdminResponse && (
                        <div className="flex gap-4 flex-row-reverse">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl rounded-tr-none border border-purple-100 dark:border-purple-900/20">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{ticket.AdminResponse}</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 mr-2 text-right">Respuesta de Soporte</p>
                            </div>
                        </div>
                    )}

                    {/* Área de Respuesta */}
                    {isAdmin && !isClosed && (
                        <div className="border-t border-gray-100 dark:border-slate-800 pt-6 mt-6">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Responder y Cerrar Ticket</label>
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                rows={4}
                                className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                placeholder="Escribe la solución aquí..."
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={() => replyMutation.mutate()}
                                    disabled={!reply.trim() || replyMutation.isPending}
                                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Enviar Respuesta
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}