import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Phone, Stethoscope, CheckCircle2, Loader2, Calendar, FileText, Fingerprint, MapPin, GraduationCap, Globe } from 'lucide-react';

import { useAuthStore } from '@/store/auth';
import { endpoints } from '@/lib/api';
import { formatRut, validateRut } from '@/lib/utils';
import { COUNTRIES } from '@/lib/constants';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import MedicalLogo from '@/components/auth/MedicalLogo';
import DatePicker from '@/components/ui/DatePicker';

const isAdult = (dateString: string) => {
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 18;
};

const profileSchema = z.object({
    full_name: z.string()
        .min(3, "El nombre completo es requerido")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/, "El nombre solo puede contener letras y puntos"),

    specialty: z.string()
        .min(3, "Indica tu especialidad médica")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\,\-]+$/, "Caracteres inválidos en especialidad"),

    phone: z.string()
        .min(8, "Teléfono inválido")
        .regex(/^\+?[0-9\s\-]{8,}$/, "Formato de teléfono inválido (ej: +56 9 1234 5678)"),

    gender: z.string().min(1, "Selecciona un género"),

    rut: z.string().min(8, "RUT inválido").refine((val) => validateRut(val), "RUT inválido"),
    nationality: z.string().min(3, "Nacionalidad requerida"),
    residence_country: z.string().min(3, "País de residencia requerido"),

    university: z.string()
        .min(3, "Universidad de egreso requerida")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\,\-]+$/, "Caracteres inválidos en universidad"),

    birth_date: z.string()
        .min(1, "La fecha es requerida")
        .refine(isAdult, "Debes ser mayor de 18 años para registrarte"),

    bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PendingApproval() {
    const { user, profile, logout, updateProfile } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {

        if (profile?.specialty && profile?.phone && profile?.birth_date) {
            setIsSuccess(true);
        }
    }, [profile]);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile?.full_name || "",
            specialty: profile?.specialty || "",
            phone: profile?.phone || "",
            gender: profile?.gender || "",
            birth_date: profile?.birth_date || "",
            bio: profile?.bio || "",
            rut: profile?.rut || "",
            nationality: profile?.nationality || "",
            residence_country: profile?.residence_country || "",
            university: profile?.university || ""
        }
    });

    const { register, handleSubmit, formState: { errors }, setValue } = form;

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            await endpoints.auth.updateProfile(data);

            updateProfile(data);

            setIsSuccess(true);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al guardar. Verifica tu conexión.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen flex w-full font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-slate-950">
            <AnimatedBackground />

            <div className="w-full flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-2xl"> {/* Hacemos la tarjeta un poco más ancha */}

                    <div className="glass-card rounded-2xl p-8 sm:p-10 shadow-xl border border-white/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl relative">

                        <div className="absolute top-6 right-6">
                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Cerrar sesión">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-8 text-center sm:text-left">
                            <MedicalLogo />
                        </div>

                        {isSuccess ? (
                            <div className="animate-fade-up text-center py-8">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">¡Perfil Completado!</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Tus datos han sido registrados. Un administrador revisará tu cuenta ({user?.email}) pronto.
                                </p>
                                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 font-medium">
                                    Estado: Pendiente de Aprobación
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 animate-fade-up-delay-1">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Completa tu Perfil</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Información requerida para validar tu cuenta profesional.</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-up-delay-2">

                                    {/* Grid de 2 columnas para optimizar espacio */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* Nombre */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Nombre Completo</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input {...register("full_name")} className="input-field w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100" placeholder="Dr. Juan Pérez" />
                                            </div>
                                            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
                                        </div>

                                        {/* Especialidad */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Especialidad</label>
                                            <div className="relative">
                                                <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input {...register("specialty")} className="input-field w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100" placeholder="Kinesiología" />
                                            </div>
                                            {errors.specialty && <p className="text-xs text-red-500">{errors.specialty.message}</p>}
                                        </div>

                                        {/* Teléfono */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Teléfono</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input {...register("phone")} className="input-field w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100" placeholder="+56 9 ..." />
                                            </div>
                                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                                        </div>

                                        {/* Fecha Nacimiento */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Fecha de Nacimiento</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <DatePicker
                                                    value={form.watch("birth_date")}
                                                    onChange={(date) => setValue("birth_date", date, { shouldValidate: true })}
                                                    className="w-full"
                                                    error={errors.birth_date?.message}
                                                    maxDate={new Date()}
                                                />
                                            </div>
                                            {errors.birth_date && <p className="text-xs text-red-500">{errors.birth_date.message}</p>}
                                        </div>

                                        {/* Género (Select) */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Género</label>
                                            <div className="relative">
                                                <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <select {...register("gender")} className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-gray-900 dark:text-gray-100">
                                                    <option value="">Seleccionar...</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Femenino">Femenino</option>
                                                    <option value="Otro">Otro</option>
                                                    <option value="Prefiero no decir">Prefiero no decir</option>
                                                </select>
                                            </div>
                                            {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
                                        </div>

                                        {/* RUT */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">RUT / Identificación</label>
                                            <div className="relative">
                                                <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...register("rut")}
                                                    onChange={(e) => {
                                                        const formatted = formatRut(e.target.value);
                                                        setValue("rut", formatted, { shouldValidate: true });
                                                    }}
                                                    className="input-field w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                                                    placeholder="12.345.678-9"
                                                />
                                            </div>
                                            {errors.rut && <p className="text-xs text-red-500">{errors.rut.message}</p>}
                                        </div>

                                        {/* Nacionalidad */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Nacionalidad</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <select {...register("nationality")} className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-gray-900 dark:text-gray-100">
                                                    <option value="">Seleccionar...</option>
                                                    {COUNTRIES.map(country => (
                                                        <option key={country} value={country}>{country}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.nationality && <p className="text-xs text-red-500">{errors.nationality.message}</p>}
                                        </div>

                                        {/* País de Residencia */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">País de Residencia</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <select {...register("residence_country")} className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-gray-900 dark:text-gray-100">
                                                    <option value="">Seleccionar...</option>
                                                    {COUNTRIES.map(country => (
                                                        <option key={country} value={country}>{country}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.residence_country && <p className="text-xs text-red-500">{errors.residence_country.message}</p>}
                                        </div>

                                        {/* Universidad */}
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Universidad de Egreso</label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input {...register("university")} className="input-field w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100" placeholder="Universidad de Chile" />
                                            </div>
                                            {errors.university && <p className="text-xs text-red-500">{errors.university.message}</p>}
                                        </div>
                                    </div>

                                    {/* Bio (Textarea) */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Biografía Breve</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <textarea
                                                {...register("bio")}
                                                rows={3}
                                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-900 dark:text-gray-100"
                                                placeholder="Resumen de tu experiencia profesional..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
                                        ) : (
                                            "Completar Registro"
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}