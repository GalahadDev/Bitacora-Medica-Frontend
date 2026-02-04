import { useEffect, useState, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/routes';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/auth';
import { endpoints } from './lib/api';
import { App as CapApp } from '@capacitor/app';
import type { URLOpenListenerEvent } from '@capacitor/app';

function App() {
  const { setAuth, logout } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    CapApp.addListener('appUrlOpen', (data: URLOpenListenerEvent) => {
      if (data.url.startsWith('com.bitacora.medica://google-auth')) {

        const urlObj = new URL(data.url.replace('#', '?'));
        const params = new URLSearchParams(urlObj.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          if (accessToken && refreshToken) {

            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            }).then(({ error }) => {
              if (!error) {

                console.log("Mobile Google Login Success");
                router.navigate('/dashboard');
              } else {
                console.error("Error setting session", error);

              }
            });
          } else {
            console.warn("No tokens found in URL");

          }
        }
      }
    });
  }, []);

  const syncWithBackend = async (session: any) => {
    const token = session.access_token;

    if (lastTokenRef.current === token) {
      setIsReady(true);
      return;
    }
    lastTokenRef.current = token;

    useAuthStore.getState().setAuth(
      token,
      { id: session.user.id, email: session.user.email!, role: "PROFESSIONAL" },
      { status: "INACTIVE", specialty: "", phone: "" }
    );

    try {
      console.log("📡 Solicitando datos al Backend...");
      const { data } = await endpoints.auth.getMe();

      const userData = data.user || data.User;

      if (!userData) throw new Error("Estructura de usuario no encontrada en respuesta");

      const rawProfile = userData.ProfileData || userData.profile_data || {};

      setAuth(
        token,
        {
          id: userData.ID || userData.id,
          email: userData.Email || userData.email,
          role: userData.Role || userData.role,
        },
        {
          status: userData.Status || userData.status,
          full_name: rawProfile.full_name || rawProfile.name,
          specialty: rawProfile.specialty,
          phone: rawProfile.phone,
          gender: rawProfile.gender,
          bio: rawProfile.bio,
          birth_date: rawProfile.birth_date,
          rut: rawProfile.rut,
          nationality: rawProfile.nationality,
          residence_country: rawProfile.residence_country,
          university: rawProfile.university,

          avatar_url: userData.AvatarURL || rawProfile.avatar_url || rawProfile.picture
        }
      );

    } catch (error: any) {
      if (error.response?.status === 403) {
        console.warn("⚠️ Usuario en espera de aprobación (403)");
      } else {
        console.error("❌ Error sincronizando:", error);

        logout();
      }
    } finally {
      setIsReady(true);
    }
  };
  useEffect(() => {

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        syncWithBackend(session);
      } else {

        lastTokenRef.current = null;
        logout();
        setIsReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-sm">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;