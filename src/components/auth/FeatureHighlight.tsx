import { ClipboardList, Shield, Clock } from "lucide-react";

const features = [
    {
        icon: ClipboardList,
        title: "Registros organizados",
        description: "Mantén un historial completo y ordenado de todas tus consultas"
    },
    {
        icon: Shield,
        title: "100% Seguro",
        description: "Tus datos clínicos protegidos con encriptación de nivel hospitalario"
    },
    {
        icon: Clock,
        title: "Acceso 24/7",
        description: "Consulta tu bitácora desde cualquier dispositivo, en cualquier momento"
    }
];

const FeatureHighlight = () => {
    return (
        <div className="hidden lg:flex flex-col justify-center p-12 xl:p-16">
            <div className="max-w-md">
                <h2 className="text-3xl xl:text-4xl font-display font-semibold text-gray-900 mb-4 animate-fade-up">
                    Tu práctica médica,{" "}
                    <span className="gradient-text">simplificada</span>
                </h2>
                <p className="text-gray-500 text-lg mb-10 animate-fade-up-delay-1">
                    La herramienta que los profesionales de la salud confían para gestionar su día a día clínico.
                </p>

                <div className="space-y-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={`flex items-start gap-4 animate-fade-up-delay-${index + 2}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <feature.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
};

export default FeatureHighlight;