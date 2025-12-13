import { motion } from 'framer-motion';
import { AlertTriangle, Info, ArrowRight } from 'lucide-react';

interface ResultsViewProps {
    onReset: () => void;
}

export default function ResultsView({ onReset }: ResultsViewProps) {
    // Mock Result Data
    const result = {
        disease: "Cystic Fibrosis",
        variant: "CFTR deltaF508",
        risk: "High",
        confidence: 99.8,
        details: "Pathogenic deletion detected in exon 11 of the CFTR gene."
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
            >
                <div className="bg-red-50 p-8 border-b border-red-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <div className="text-red-600 font-bold uppercase tracking-wider text-sm mb-1">High Risk Detected</div>
                        <h2 className="text-3xl font-bold text-slate-900">{result.disease}</h2>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-sm text-slate-500">Confidence Score</div>
                        <div className="text-3xl font-bold text-slate-900">{result.confidence}%</div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-500" />
                                Variant Details
                            </h3>
                            <p className="text-slate-600">{result.variant}</p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-500" />
                                Clinical Interpretation
                            </h3>
                            <p className="text-slate-600">{result.details}</p>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-6 mb-8">
                        <h4 className="font-bold text-slate-900 mb-2">Recommended Next Steps</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Schedule genetic counseling session
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Confirmatory Sanger sequencing
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Family screening evaluation
                            </li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onReset}
                            className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Analyze Another Sample
                        </button>
                        <button className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            Download Full Report
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
