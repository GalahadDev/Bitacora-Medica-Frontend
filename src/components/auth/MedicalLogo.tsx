const MedicalLogo = () => {
    return (
        <div className="flex flex-col items-center gap-4 animate-fade-up">
            <div className="relative">
                <img src="/logo.png" alt="MedLog" className="w-24 h-24 object-contain" />
            </div>
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">MedLog</h1>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Bitácora Médica</p>
            </div>
        </div>
    );
};
export default MedicalLogo;