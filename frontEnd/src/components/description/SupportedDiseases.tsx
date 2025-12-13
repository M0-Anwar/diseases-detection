import { CheckCircle2 } from 'lucide-react';

const diseases = [
    "Sickle Cell Anemia",
    "Cystic Fibrosis",
    "Hemophilia A & B",
    "Muscular Dystrophy (Duchenne/Becker)",
    "Huntington's Disease",
    "Tay-Sachs Disease",
    "Thalassemia",
    "Fragile X Syndrome"
];

export default function SupportedDiseases() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Supported Conditions</h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Our AI model is currently optimized to detect mutations associated with a wide range of monogenic disorders. We continuously update our database to expand coverage.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {diseases.map((disease, index) => (
                                <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-sm font-medium text-slate-700">{disease}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative h bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">Medical Disclaimer</h3>
                            <p className="opacity-90 leading-relaxed mb-6">
                                This system is a clinical decision support tool designed for educational and research purposes. It does not replace professional medical diagnosis, genetic counseling, or confirmatory laboratory testing.
                            </p>
                            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <p className="text-sm font-medium">Always consult with a qualified healthcare provider for clinical decision making.</p>
                            </div>
                        </div>

                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    </div>
                </div>
            </div>
        </section>
    );
}
