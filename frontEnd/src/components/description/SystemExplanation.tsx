import { motion } from 'framer-motion';
import { Microscope, Dna, BrainCircuit } from 'lucide-react';

export default function SystemExplanation() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Understanding Genetic Disease Detection</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Our platform utilizes advanced artificial intelligence to analyze genetic sequences, identifying mutations that may lead to inherited disorders. By combining genomic data with machine learning, we provide early and accurate risk assessments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                            <Dna className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Genetic Data Analysis</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            We process raw sequencing data to identify Single Nucleotide Polymorphisms (SNPs) and structural variants associated with pathogenicity.
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                            <BrainCircuit className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">AI Model Inference</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Our deep learning models, trained on ClinVar and gnomAD datasets, predict the clinical significance of detected variants with high confidence.
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                            <Microscope className="w-6 h-6 text-teal-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Clinical Insights</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Results are translated into actionable medical reports, classifying variants as Benign, Likely Pathogenic, or Pathogenic.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
