import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { endpoints } from '../../lib/api';

const sessionSchema = z.object({

    patient_id: z.string().uuid({ message: "Seleccione un paciente válido" }),
    intervention_plan: z.string().min(1, "El plan es requerido"),
    description: z.string().min(10, "La descripción debe ser más detallada"),
    achievements: z.string().optional(),
    has_incident: z.boolean(),
    incident_details: z.string().optional(),

}).refine((data) => {
    if (data.has_incident && (!data.incident_details || data.incident_details.length < 5)) {
        return false;
    }
    return true;
}, {
    message: "Debe detallar el incidente si reporta un evento adverso",
    path: ["incident_details"],
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export default function SessionWizard() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SessionFormValues>({
        resolver: zodResolver(sessionSchema),
        defaultValues: {
            has_incident: false,
            patient_id: "",
            intervention_plan: "",
            description: "",
            achievements: "",
            incident_details: ""
        },
        mode: "onBlur"
    });

    const { register, handleSubmit, watch, formState: { errors } } = form;

    const hasIncident = watch("has_incident");

    const onSubmit = async (data: SessionFormValues) => {
        setIsSubmitting(true);
        try {
            await endpoints.sessions.create(data);
            alert("Sesión creada exitosamente");
        } catch (error) {
            console.error(error);
            alert("Error al guardar sesión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Nueva Evolución Clínica</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* ID Paciente */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">ID Paciente</label>
                    <input
                        {...register("patient_id")}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="UUID del paciente..."
                    />
                    {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id.message}</p>}
                </div>

                {/* Plan */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Plan de Intervención</label>
                    <input
                        {...register("intervention_plan")}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.intervention_plan && <p className="text-red-500 text-sm mt-1">{errors.intervention_plan.message}</p>}
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Descripción Desarrollo</label>
                    <textarea
                        {...register("description")}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                {/* Switch de Incidente */}
                <div className={`p-4 rounded-md border transition-colors ${hasIncident ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="has_incident"
                            {...register("has_incident")}
                            className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="has_incident" className="font-medium text-gray-900 cursor-pointer select-none">
                            ¿Ocurrió un incidente o evento adverso?
                        </label>
                    </div>

                    {/* Renderizado Condicional */}
                    {hasIncident && (
                        <div className="mt-4 pl-8">
                            <label className="block text-sm font-bold text-red-700 mb-1">
                                Detalles del Incidente (Obligatorio)
                            </label>
                            <textarea
                                {...register("incident_details")}
                                className="w-full border-red-300 bg-white focus:border-red-500 focus:ring-red-500 rounded p-2 border"
                                placeholder="Describa qué ocurrió, medidas tomadas..."
                                rows={3}
                            />
                            {errors.incident_details && (
                                <p className="text-red-600 text-sm mt-1 font-medium">{errors.incident_details.message}</p>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                    {isSubmitting ? 'Guardando...' : 'Finalizar Sesión'}
                </button>
            </form>
        </div>
    );
}