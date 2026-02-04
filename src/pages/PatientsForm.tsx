import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, FileText, X, Loader2, Save } from 'lucide-react';
import { endpoints } from '@/lib/api';
import { formatRut, validateRut } from '@/lib/utils';
import DatePicker from '@/components/ui/DatePicker';

const patientSchema = z.object({
    first_name: z.string().min(2, "El nombre es requerido"),
    last_name: z.string().min(2, "El apellido es requerido"),
    rut: z.string().min(8, "RUT inválido").refine((val) => validateRut(val), "RUT inválido"),
    birth_date: z.string().min(1, "La fecha es requerida").refine((date) => {
        return new Date(date) <= new Date();
    }, "La fecha no puede ser futura"),
    sex: z.string().min(1, "Selecciona un sexo"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    emergency_phone: z.string().optional(),
    diagnosis: z.string().optional(),
    consent_pdf_url: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientForm() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);



    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema)
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert("Solo se permiten archivos PDF");
            return;
        }

        setFileToUpload(file);
    };

    const onSubmit = async (data: PatientFormValues) => {

        if (!data.consent_pdf_url && !fileToUpload) {

            alert("Debes seleccionar el Consentimiento Informado (PDF) antes de continuar.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                consent_pdf_url: ""
            };

            const res = await endpoints.patients.create(payload);
            const newPatientId = res.data.data.ID;

            if (fileToUpload) {
                const formData = new FormData();
                formData.append('file', fileToUpload);

                try {
                    const uploadRes = await endpoints.uploads.consent(formData, newPatientId);

                    await endpoints.patients.update(newPatientId, {
                        consent_pdf_url: uploadRes.data.path
                    } as any);

                } catch (uploadError) {
                    console.error("Error subiendo PDF:", uploadError);
                    alert("Paciente creado, pero falló la subida del PDF. Por favor súbelo desde el perfil.");
                }
            }

            navigate('/dashboard/patients');
        } catch (error) {
            console.error(error);
            alert("Error al crear el paciente");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nuevo Paciente</h1>
                <button type="button" onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Cancelar</button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* SECCIÓN 1: Datos Personales */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-slate-800 pb-2">Información Personal</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                <input {...register('first_name')} className="input-field w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" placeholder="Ej: Ana" />
                                {errors.first_name && <span className="text-xs text-red-500">{errors.first_name.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                                <input {...register('last_name')} className="input-field w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" placeholder="Ej: López" />
                                {errors.last_name && <span className="text-xs text-red-500">{errors.last_name.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RUT</label>
                                <input
                                    {...register('rut')}
                                    onChange={(e) => {
                                        const formatted = formatRut(e.target.value);
                                        setValue('rut', formatted, { shouldValidate: true });
                                    }}
                                    className="input-field w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                                    placeholder="12.345.678-9"
                                />
                                {errors.rut && <span className="text-xs text-red-500">{errors.rut.message}</span>}
                            </div>

                            {/* FECHA DE NACIMIENTO CON VALIDACIÓN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
                                <DatePicker
                                    value={watch('birth_date')}
                                    onChange={(date) => setValue('birth_date', date, { shouldValidate: true })}
                                    maxDate={new Date()}
                                    className="w-full"
                                    error={errors.birth_date?.message}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                                <select
                                    {...register('sex')}
                                    className="input-field w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {errors.sex && <span className="text-xs text-red-500">{errors.sex.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: Contacto y Clínico */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-slate-800 pb-2">Detalles Clínicos y Contacto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" {...register('email')} className="input-field w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" placeholder="correo@paciente.com" />
                                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                <input {...register('phone')} className="input-field w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" placeholder="+56 9 ..." />
                            </div>

                            {/* NUEVO CAMPO: TELEFONO EMERGENCIA */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono de Emergencia (Familiar)</label>
                                <input
                                    {...register('emergency_phone')}
                                    className="input-field w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none placeholder-red-200 bg-white dark:bg-slate-800 border-gray-200 dark:border-red-900/50 text-gray-900 dark:text-gray-100"
                                    placeholder="+56 9 ... (En caso de emergencia)"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnóstico Inicial</label>
                                <input {...register('diagnosis')} className="input-field w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" placeholder="Ej: Lumbago crónico" />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: Consentimiento (Sin cambios) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-slate-800 pb-2">Documentación Legal</h3>

                        <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors relative">
                            {fileToUpload ? (
                                <div className="flex items-center justify-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                                    <FileText className="w-6 h-6 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">
                                        {fileToUpload.name} (Listo para subir)
                                    </span>
                                    <button type="button" onClick={() => setFileToUpload(null)} className="p-1 hover:bg-green-200 rounded-full">
                                        <X className="w-4 h-4 text-green-700" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600 font-medium">Arrastra tu PDF de Consentimiento aquí</p>
                                    <p className="text-xs text-gray-400 mt-1">o haz clic para buscar</p>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium">Cancelar</button>
                        <button
                            type="submit"
                            disabled={isSubmitting || (!fileToUpload && !watch('consent_pdf_url'))}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Registrar Paciente
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
