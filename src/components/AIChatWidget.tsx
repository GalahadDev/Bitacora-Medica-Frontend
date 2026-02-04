import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatWidgetProps {
    patientId: string;
}

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/chat";

export default function AIChatWidget({ patientId }: AIChatWidgetProps) {
    const { token } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hola, soy tu asistente médico IA. ¿En qué puedo ayudarte con este paciente hoy?' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userMsg.content,
                    patientId: patientId,
                    token: token
                })
            });

            if (!response.ok) throw new Error('Error connecting to AI Agent');

            const data = await response.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer || "Lo siento, no pude procesar la respuesta."
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Hubo un error al conectar con el asistente. Asegúrate de que n8n esté corriendo."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-3 font-sans isolate">

            {/* Ventana de Chat */}
            {isOpen && (
                <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[60vh] sm:h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 mb-4 sm:mb-2 mr-0 sm:mr-2">

                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Asistente Médico IA</h3>
                                <p className="text-[10px] text-blue-100 opacity-90">Potenciado por Gemini 1.5</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-tl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregunta sobre el historial del paciente..."
                                className="w-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent focus:bg-white dark:focus:bg-slate-900"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1.5 p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Botón Flotante (Launcher) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${isOpen
                    ? 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rotate-90'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
            </button>
        </div>,
        document.body
    );
}
