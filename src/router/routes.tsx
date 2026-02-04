import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import PendingApproval from '@/pages/PendingApproval';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import PatientList from '@/pages/PatientList';
import PatientForm from '@/pages/PatientsForm';
import PatientDetail from '@/pages/PatientDetail';
import SupportPage from '@/pages/SupportPage';
import Profile from '@/pages/Profile';

const ProtectedRoute = () => {
    const { isAuthenticated, profile } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" />;
    }

    if (profile?.status === 'INACTIVE') {
        return <Navigate to="/pending-approval" />;
    }

    return <Outlet />;
};

const ApprovalGuard = () => {
    const { isAuthenticated, profile } = useAuthStore();

    if (isAuthenticated && profile?.status === 'ACTIVE') {
        return <Navigate to="/dashboard" />;
    }
    return <Outlet />;
};

export const router = createBrowserRouter([
    {
        path: '/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: <Navigate to="/dashboard" />,
    },
    {
        path: '/pending-approval',
        element: <ApprovalGuard />,
        children: [
            { path: '', element: <PendingApproval /> }
        ]
    },

    {
        path: '/dashboard',
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [

                    { index: true, element: <Dashboard /> },

                    {
                        path: 'admin',
                        element: <AdminDashboard />
                    },

                    {
                        path: 'patients',
                        element: <PatientList />
                    },
                    {
                        path: 'patients/new',
                        element: <PatientForm />
                    },
                    {
                        path: 'patients/:id',
                        element: <PatientDetail />
                    },
                    {
                        path: 'support',
                        element: <SupportPage />
                    },
                    {
                        path: 'settings',
                        element: <Profile />
                    },
                ]
            },
        ],
    },
]);