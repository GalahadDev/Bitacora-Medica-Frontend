import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Mail, Loader2, Send, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { endpoints } from '@/lib/api';
import Modal from '@/components/ui/Modal';

interface InviteModalProps {
    patientId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ patientId, isOpen, onClose }: InviteModalProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setMessage("");
            setEmail("");
        }
    }, [isOpen]);

    const inviteMutation = useMutation({
        mutationFn: async (emailToInvite: string) => {
            await endpoints.collaborations.invite({
                patient_id: patientId,
                email: emailToInvite
            });
        },
        onSuccess: () => {
            setStatus('success');
            setMessage("¡Invitación enviada correctamente!");
            setEmail("");
            setTimeout(() => {
                onClose();
            }, 2000);
        },
        onError: (error: any) => {
            setStatus('error');
            const statusCode = error.response?.status;
            const msg = error.response?.data?.error || "Error al enviar invitación";

            if (statusCode === 403) {
                setMessage("No tienes permisos para invitar a otros profesionales. Solo el creador del paciente puede hacerlo.");
            } else if (msg.includes("not found")) {
                setMessage("El usuario no existe en MedLog. Pídele que se registre primero.");
            } else if (msg.includes("already")) {
                setMessage("Este usuario ya ha sido invitado.");
            } else {
                setMessage(msg);
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        inviteMutation.mutate(email);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Invitar Colaborador
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Mensajes de Estado */}
                    {status === 'success' && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex gap-3 items-start text-sm text-green-700 dark:text-green-300 border border-green-100 dark:border-green-900/30 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                            <p className="font-medium">{message}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex gap-3 items-start text-sm text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                            <p className="font-medium">{message}</p>
                        </div>
                    )}

                    {status === 'idle' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 items-start text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>
                                El profesional debe estar registrado en la plataforma para recibir la invitación.
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder="colega@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={inviteMutation.isPending || !email}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {inviteMutation.isPending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                            ) : (
                                <><Send className="w-4 h-4" /> Enviar Invitación</>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </Modal>
    );
}