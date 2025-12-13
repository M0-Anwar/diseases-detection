import { motion } from 'framer-motion';
import { Upload, FileCog, Cpu, Activity, FileText } from 'lucide-react';

const steps = [
    { icon: Upload, title: "Data Upload", desc: "Upload CSV/JSON genetic data" },
    { icon: FileCog, title: "Preprocessing", desc: "Normalization & validation" },
    { icon: Cpu, title: "AI Analysis", desc: "Deep learning inference" },
    { icon: Activity, title: "Prediction", desc: "Risk scoring & classification" },
    { icon: FileText, title: "Report", desc: "Start Medical Report generation" }
];

export default function Workflow() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">Analysis Workflow</h2>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden md:block" />

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="w-16 h-16 bg-white border-4 border-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:border-blue-500 transition-colors duration-300 shadow-sm">
                                    <step.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                                <p className="text-xs text-slate-500">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
