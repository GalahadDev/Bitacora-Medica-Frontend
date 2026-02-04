import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

export default function Modal({ isOpen, onClose, children, className, showCloseButton = false }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Overlay click para cerrar */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Contenido */}
            <div className={cn("relative z-10", className)} onClick={(e) => e.stopPropagation()}>
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute -top-2 -right-2 p-1 bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-lg border border-gray-100 z-50 hover:scale-110 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                {children}
            </div>
        </div>,
        document.body
    );
}
