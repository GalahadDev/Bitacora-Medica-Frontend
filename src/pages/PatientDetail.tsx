import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import {
    Calendar, Phone, Activity, FileText,
    AlertCircle, Save, Loader2, Mail, Fingerprint, Users, Stethoscope, Filter,
    FileBarChart, Trash2, FolderOpen
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import InviteModal from '@/components/patients/InviteModal';
import SessionTimeline from '@/components/sessions/SessionTimeline';
import SessionFormModal from '@/components/sessions/SessionFormModal';
import PatientReportsList from '@/components/reports/PatientReportsList';
import ReportFormModal from '@/components/reports/ReportFormModal';
import MasterReportModal from '@/components/reports/MasterReportModal';
import ConsentModal from '@/components/patients/ConsentModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import AIChatWidget from '@/components/AIChatWidget';
import DocumentRepository from '@/components/documents/DocumentRepository';

const formatRut = (rut: string) => {
    if (!rut) return "";
    const cleanRut = rut.replace(/[^0-9kK]/g, "");
    if (cleanRut.length < 2) return cleanRut;
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();
    let formattedBody = "";
    for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
        formattedBody = body.charAt(i) + formattedBody;
        if (j % 3 === 0 && i !== 0) formattedBody = "." + formattedBody;
    }
    return `${formattedBody}-${dv}`;
};

export default function PatientDetail() {

    const { id } = useParams();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [careNotes, setCareNotes] = useState("");
    const [disabilityReport, setDisabilityReport] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
    const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
    const [collabToUnlink, setCollabToUnlink] = useState<{ id: string, name: string } | null>(null);
    const [isUnlinking, setIsUnlinking] = useState(false);
    const [activeTab, setActiveTab] = useState<'timeline' | 'reports' | 'repository'>('timeline');
    const [selectedProfessional, setSelectedProfessional] = useState("");
    const [sessionToEdit, setSessionToEdit] = useState<any>(null);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['patient', id],
        queryFn: async () => {
            const res = await endpoints.patients.getById(id!);
            return res.data.data;
        },
        enabled: !!id
    });

    useEffect(() => {
        if (profile?.patient) {
            const p = profile.patient;
            const info = p.PersonalInfo || {};
            setDisabilityReport(p.DisabilityReport || info.diagnosis || "");
            setCareNotes(p.CareNotes || "");
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            await endpoints.patients.update(id!, {
                disability_report: disabilityReport,
                care_notes: careNotes
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient', id] });
            setIsEditing(false);
        }
    });

    const handleOpenCreateModal = () => {
        setSessionToEdit(null);
        setIsSessionModalOpen(true);
    };

    const handleEditSession = (session: any) => {
        setSessionToEdit(session);
        setIsSessionModalOpen(true);
    };

    const handleUnlinkClick = (collaboratorId: string, collaboratorName: string) => {
        setCollabToUnlink({ id: collaboratorId, name: collaboratorName });
        setIsUnlinkModalOpen(true);
    };

    const handleConfirmUnlink = async () => {
        if (!collabToUnlink) return;

        setIsUnlinking(true);
        try {
            await endpoints.collaborations.delete(collabToUnlink.id);
            queryClient.invalidateQueries({ queryKey: ['patient', id] });
            setIsUnlinkModalOpen(false);
            setCollabToUnlink(null);
        } catch (error) {
            console.error("Error unlinking collaborator:", error);
            alert("Error al desvincular. Intenta nuevamente.");
        } finally {
            setIsUnlinking(false);
        }
    };

    if (isLoading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Paciente no encontrado</div>;

    const { patient, team, incident_count } = profile;
    const info = patient.PersonalInfo || {};

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">

            {/* --- HEADER --- */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-start gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="w-32 h-32 text-blue-600" />
                </div>

                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-blue-200 shadow-xl shrink-0 z-10">
                    {info.first_name?.[0]}{info.last_name?.[0]}
                </div>

                <div className="flex-1 z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{info.first_name} {info.last_name}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${incident_count > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30'}`}>
                            {incident_count > 0 ? `${incident_count} Incidentes` : 'Sin Incidentes'}
                        </span>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-lg">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{formatRut(info.rut)}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></span>
                        <span>{info.age} años</span>
                    </p>
                </div>

                <div className="z-10 flex flex-col gap-2">
                    <button
                        onClick={() => setIsConsentModalOpen(true)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
                    >
                        <FileText className="w-4 h-4" /> Ver Consentimiento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- COLUMNA IZQUIERDA (2/3): BITÁCORA Y REPORTES --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Notas Clínicas */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                Consideraciones Clínicas
                            </h3>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-sm text-blue-600 hover:underline font-medium">
                                    Editar Notas
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                                    <button
                                        onClick={() => updateMutation.mutate()}
                                        disabled={updateMutation.isPending}
                                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center gap-1"
                                    >
                                        {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        Guardar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Reporte de Discapacidad / Diagnóstico
                                </label>
                                {isEditing ? (
                                    <input
                                        value={disabilityReport}
                                        onChange={(e) => setDisabilityReport(e.target.value)}
                                        className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-gray-700 dark:text-gray-200"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-800 dark:text-gray-200 font-medium">
                                        {disabilityReport || "No especificado"}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Notas de Cuidado (Care Notes)
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={careNotes}
                                        onChange={(e) => setCareNotes(e.target.value)}
                                        rows={4}
                                        className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900 outline-none resize-none text-gray-700 dark:text-gray-200"
                                        placeholder="Ej: Paciente con visión reducida..."
                                    />
                                ) : (
                                    <div className={`p-4 rounded-lg border ${careNotes ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 text-amber-900 dark:text-amber-200' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400 dark:text-gray-500 italic'}`}>
                                        {careNotes || "Sin consideraciones especiales registradas."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- ZONA CENTRAL: SISTEMA DE TABS --- */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 min-h-[500px] overflow-hidden">

                        <div className="flex border-b border-gray-100 dark:border-slate-800 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex-none sm:flex-1 px-4 py-4 text-sm font-medium text-center border-b-2 transition-colors whitespace-nowrap ${activeTab === 'timeline'
                                    ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Activity className="w-4 h-4" /> Bitácora de Sesiones
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`flex-none sm:flex-1 px-4 py-4 text-sm font-medium text-center border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reports'
                                    ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="w-4 h-4" /> Reportes Mensuales
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('repository')}
                                className={`flex-none sm:flex-1 px-4 py-4 text-sm font-medium text-center border-b-2 transition-colors whitespace-nowrap ${activeTab === 'repository'
                                    ? 'border-amber-600 dark:border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FolderOpen className="w-4 h-4" /> Repositorio
                                </div>
                            </button>
                        </div>

                        {/* Contenido de los Tabs */}
                        <div className="p-6">

                            {/* VISTA 1: BITÁCORA */}
                            {activeTab === 'timeline' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            Historial de Evoluciones
                                        </h3>

                                        {/* CONTROLES: FILTRO + BOTÓN */}
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            {/* Dropdown de Filtro */}
                                            <div className="relative flex-1 sm:flex-none">
                                                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <select
                                                    value={selectedProfessional}
                                                    onChange={(e) => setSelectedProfessional(e.target.value)}
                                                    className="w-full sm:w-48 pl-9 pr-8 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <option value="">Todos</option>
                                                    {team?.map((member: any) => {
                                                        let pData = member.ProfileData || {};
                                                        if (typeof pData === 'string') {
                                                            try { pData = JSON.parse(pData); } catch (e) { pData = {}; }
                                                        }
                                                        const name = pData.full_name || pData.name || member.Email;
                                                        return <option key={member.ID} value={member.ID}>{name}</option>;
                                                    })}
                                                </select>
                                            </div>

                                            {/* Botón Nueva Evolución */}
                                            <button
                                                onClick={handleOpenCreateModal}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 shrink-0"
                                            >
                                                + Nueva
                                            </button>
                                        </div>
                                    </div>

                                    {/* Timeline con Filtro y Edición */}
                                    <SessionTimeline
                                        patientId={id!}
                                        filterProfessional={selectedProfessional}
                                        onEditSession={handleEditSession}
                                    />
                                </div>
                            )}

                            {/* VISTA 2: REPORTES */}
                            {activeTab === 'reports' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Reportes de Progreso</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Informes periódicos generados por el equipo.</p>
                                        </div>

                                        {/* GRUPO DE BOTONES (MODIFICADO) */}
                                        <div className="flex gap-2">
                                            {/* Botón Consolidado */}
                                            {/* Botón Consolidado */}
                                            <button
                                                onClick={() => setIsMasterModalOpen(true)}
                                                className="px-4 py-2 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 transition-colors text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm"
                                            >
                                                <FileBarChart className="w-4 h-4" />
                                                Consolidado
                                            </button>

                                            {/* Botón Redactar */}
                                            <button
                                                onClick={() => setIsReportModalOpen(true)}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
                                            >
                                                + Redactar Reporte
                                            </button>
                                        </div>
                                    </div>

                                    <PatientReportsList patientId={id!} />
                                </div>
                            )}

                            {/* VISTA 3: REPOSITORIO */}
                            {activeTab === 'repository' && (
                                <DocumentRepository patientId={id!} />
                            )}

                        </div>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA (1/3): INFO Y EQUIPO --- */}
                <div className="space-y-6">

                    {/* Ficha Personal */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-50 dark:border-slate-800">Ficha Personal</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <Fingerprint className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">RUT</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatRut(info.rut)}</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Sexo / Género</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.sex || "No especificado"}</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.birth_date}</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-50 dark:border-slate-800">Contacto</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 items-center">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{info.phone || "Sin teléfono"}</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{info.email}</span>
                            </li>
                            {info.emergency_phone && (
                                <li className="pt-2 mt-2 border-t border-gray-50 dark:border-slate-800">
                                    <p className="text-xs text-red-500 font-bold mb-1 uppercase tracking-wide">En caso de emergencia</p>
                                    <div className="flex gap-2 items-center text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
                                        <Phone className="w-4 h-4" />
                                        <span className="font-bold text-sm">{info.emergency_phone}</span>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Equipo Médico */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center">
                            <span>Equipo Médico</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{team?.length || 0}</span>
                        </h3>

                        {(!team || team.length === 0) ? (
                            <p className="text-gray-400 text-sm text-center py-4">No hay profesionales asignados</p>
                        ) : (
                            <ul className="space-y-4">
                                {team.map((member: any) => {
                                    const mInfo = member.ProfileData || {};
                                    const mName = mInfo.full_name || mInfo.name || member.Email;
                                    const mRole = mInfo.specialty || "Profesional de la Salud";
                                    const mInitials = mName.slice(0, 2).toUpperCase();
                                    const isOwner = user?.id === patient.CreatorID;
                                    const canDelete = isOwner && user?.id !== member.ID;

                                    return (
                                        <li key={member.ID} className="flex items-center gap-3 justify-between group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
                                                    {mInitials}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{mName}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <Stethoscope className="w-3 h-3" />
                                                        <span className="truncate">{mRole}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleUnlinkClick(member.collaboration_id, mName)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Desvincular"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="mt-4 w-full py-2 text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/20"
                        >
                            + Invitar Profesional
                        </button>
                    </div>

                </div>

            </div>

            {/* MODALES */}
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                patientId={id!}
            />

            <SessionFormModal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                patientId={id!}
                sessionToEdit={sessionToEdit}
            />

            <ReportFormModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                patientId={id!}
            />

            {/* MODAL DE REPORTE MAESTRO (NUEVO) */}
            <MasterReportModal
                isOpen={isMasterModalOpen}
                onClose={() => setIsMasterModalOpen(false)}
                patientId={id!}
                patientName={`${info.first_name} ${info.last_name}`}
            />

            {/* MODAL DE CONSENTIMIENTO */}
            <ConsentModal
                isOpen={isConsentModalOpen}
                onClose={() => setIsConsentModalOpen(false)}
                pdfUrl={patient.ConsentPDFUrl}
            />

            {/* MODAL DE CONFIRMACIÓN DE DESVINCULACIÓN */}
            <ConfirmationModal
                isOpen={isUnlinkModalOpen}
                onClose={() => setIsUnlinkModalOpen(false)}
                onConfirm={handleConfirmUnlink}
                title="Desvincular Profesional"
                message={`¿Estás seguro que deseas desvincular a ${collabToUnlink?.name} de este paciente? Esta acción no eliminará el historial de sesiones realizadas por este profesional.`}
                confirmText="Sí, desvincular"
                cancelText="Cancelar"
                isDestructive={true}
                isLoading={isUnlinking}
            />

            {/* AI CHATBOT FLOAT BUTTON */}
            <AIChatWidget patientId={id!} />
        </div>
    );
}