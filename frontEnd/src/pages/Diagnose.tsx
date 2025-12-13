import { useState } from 'react';
import Layout from '../components/layout/Layout';
import UploadSection from '../components/diagnose/UploadSection';
import AnalysisView from '../components/diagnose/AnalysisView';
import ResultsView from '../components/diagnose/ResultsView';
import { motion, AnimatePresence } from 'framer-motion';

export default function Diagnose() {
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');

    const handleUpload = (file: File) => {
        // Simulate upload processing
        console.log("Uploaded:", file.name);
        setStatus('analyzing');
        // Simulate analysis delay
        setTimeout(() => {
            setStatus('complete');
        }, 6000); // 6 seconds for the 4 steps
    };

    const handleReset = () => {
        setStatus('idle');
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex flex-col justify-center bg-slate-50">
                <div className="container mx-auto px-6 py-12">
                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="text-center mb-12">
                                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Start Genetic Analysis</h1>
                                    <p className="text-slate-600 max-w-xl mx-auto">
                                        Upload your VCF, CSV, or JSON sequencing data to begin our AI-powered variant analysis pipeline.
                                    </p>
                                </div>
                                <UploadSection onUpload={handleUpload} />
                            </motion.div>
                        )}

                        {status === 'analyzing' && (
                            <motion.div
                                key="analysis"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-center"
                            >
                                <AnalysisView />
                            </motion.div>
                        )}

                        {status === 'complete' && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <ResultsView onReset={handleReset} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
}
