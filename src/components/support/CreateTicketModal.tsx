import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { X, MessageSquare, Send, Loader2 } from 'lucide-react';
import { endpoints } from '@/lib/api';
import Modal from '@/components/ui/Modal';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            await endpoints.support.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            reset();
            onClose();
        }
    });

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" /> Nuevo Ticket
                    </h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                </div>

                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asunto</label>
                        <input
                            {...register("subject", { required: true })}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none"
                            placeholder="Ej: Problema al subir imagen..."
                        />
                        {errors.subject && <span className="text-xs text-red-500">Requerido</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
                        <textarea
                            {...register("message", { required: true })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none resize-none"
                            placeholder="Describa su problema detalladamente..."
                        />
                        {errors.message && <span className="text-xs text-red-500">Requerido</span>}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Enviar Ticket
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}