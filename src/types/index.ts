export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'PROFESSIONAL' | 'INACTIVE';
}

export interface UserProfile {
    full_name?: string;
    specialty: string;
    phone: string;
    rut?: string;
    bio?: string;
    birth_date?: string;
    gender?: string;
    nationality?: string;
    residence_country?: string;
    university?: string;
    status: 'ACTIVE' | 'INACTIVE';
    avatar_url?: string;
}

export interface Patient {
    id: string;
    created_at: string;
    personal_info: PatientPersonalInfo;
    consent_pdf_url?: string;
}

export interface SessionPayload {
    patient_id: string;
    intervention_plan: string;
    description: string;
    has_incident: boolean;
    incident_details?: string;
    photos?: string[];
}

export interface PatientUI {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    lastVisit: string;
    status: "active" | "pending";
    diagnosis: string;
    avatar?: string;
}

export interface PatientPersonalInfo {
    first_name: string;
    last_name: string;
    rut: string;
    email: string;
    phone: string;
    birth_date: string;
    diagnosis?: string;
}