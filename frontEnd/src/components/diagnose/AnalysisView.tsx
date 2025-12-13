import { motion } from 'framer-motion';
import { Activity, Dna, Database, Search, Check as CheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
    { text: "Parsing sequencing data...", icon: Dna },
    { text: "Aligning to reference genome...", icon: Database },
    { text: "Identifying variant calls...", icon: Search },
    { text: "Predicting pathogenicity...", icon: Activity }
];

export default function AnalysisView() {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-md mx-auto text-center">
            <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-10 h-10 text-primary animate-pulse" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Sample</h3>
            <p className="text-slate-500 mb-8">Please wait while our AI processes the data...</p>

            <div className="space-y-4 text-left bg-slate-50 p-6 rounded-xl border border-slate-100">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div key={index} className="flex items-center gap-3">
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
                ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-primary text-white" : "bg-slate-200 text-slate-400"}
              `}>
                                {isCompleted ? <CheckIcon className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${isActive || isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                                {step.text}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-step"
                                    className="ml-auto w-2 h-2 bg-primary rounded-full animate-ping"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
