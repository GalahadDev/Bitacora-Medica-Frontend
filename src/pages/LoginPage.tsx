import AnimatedBackground from "@/components/auth/AnimatedBackground";
import MedicalLogo from "@/components/auth/MedicalLogo";
import FeatureHighlight from "@/components/auth/FeatureHighlight";
import LoginForm from "@/pages/LoginForm";

const LoginPage = () => {
    return (
        <div className="min-h-screen flex w-full font-sans text-gray-900">
            <AnimatedBackground />

            {/* Lado Izquierdo - Features */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center">
                <FeatureHighlight />
            </div>

            {/* Lado Derecho - Login Form */}
            <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12 z-10">
                <div className="w-full max-w-md">
                    {/* Modern Card */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/50 ring-1 ring-gray-900/5 relative overflow-hidden">


                        <div className="mb-10">
                            <MedicalLogo />
                        </div>

                        <div className="mb-8 text-center animate-fade-up-delay-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                                ¡Hola de nuevo!
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Ingresa a tu cuenta para continuar
                            </p>
                        </div>

                        <LoginForm />
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-8 animate-fade-up-delay-4">
                        &copy; {new Date().getFullYear()} Bitácora Médica v1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;