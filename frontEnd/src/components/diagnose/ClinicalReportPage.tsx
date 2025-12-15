import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, ArrowRight, Download, Printer, Loader2, FileText, Shield, Calendar, User, Dna, Plus } from 'lucide-react';
import Layout from '../layout/Layout';
import { generatePDF } from '../Utils/generatePDF';
import { generateTextReport } from '../Utils/generateTextReport';
import { printReport } from '../Utils/printReport';
import { diseaseDescriptions } from '../Utils/diseaseData';

type Disease = {
    id: string;
    name: string;
    confidence: number;
    mutations: string[];
    pathogenicity: "High" | "Medium" | "Low";
    description: string;
    references: string[];
}

export default function ClinicalReportPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [generatingText, setGeneratingText] = useState(false);

    // Extract data safely with multiple possible property names
    const state = location.state as {
        diseaseData?: Disease;
        inputSnps?: string[];
        snps?: string[];
        selectedDisease?: Disease;
        formData?: any;
        userSnps?: string[];
    } || {};

    // Debug logging
    console.log('Received state:', state);

    // Try multiple possible sources for disease data
    const diseaseData = state.diseaseData || state.selectedDisease || {
        id: 'glioma-001',
        name: 'Non-glioblastoma glioma',
        confidence: 74.51,
        mutations: ['IDH1 R132H', 'TP53 R175H', '1p/19q co-deletion', 'ATRX loss'],
        pathogenicity: "Medium" as "Medium",
        description: "Glioma represents a heterogeneous group of primary brain tumors...",
        references: []
    };

    const getEnhancedDescription = (diseaseName: string) => {
        if (diseaseDescriptions[diseaseName]) {
            return diseaseDescriptions[diseaseName];
        }

        const normalizedName = diseaseName.toLowerCase();
        for (const [key, description] of Object.entries(diseaseDescriptions)) {
            if (key.toLowerCase().includes(normalizedName) || normalizedName.includes(key.toLowerCase())) {
                return description;
            }
        }
        // Fallback to generic description
        return `Genetic analysis for ${diseaseName} reveals specific markers associated with disease risk. The identified variants suggest predisposition based on polygenic risk scoring and established genetic associations in clinical databases.`;
    };

    // Get risk info based on confidence
    const getRiskInfo = () => {
        const confidence = diseaseData.confidence;
        if (confidence >= 75) {
            return {
                level: 'High',
                bg: 'bg-red-50 dark:bg-red-500/10',
                border: 'border-red-100 dark:border-red-500/20',
                text: 'text-red-600 dark:text-red-400',
                iconBg: 'bg-red-100 dark:bg-red-500/20',
                iconColor: 'text-red-600 dark:text-red-400',
                badgeBg: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20',
                progressBar: 'bg-red-500',
                riskLevel: 'High'
            };
        } else if (confidence >= 55) {
            return {
                level: 'Medium',
                bg: 'bg-yellow-50 dark:bg-yellow-500/10',
                border: 'border-yellow-100 dark:border-yellow-500/20',
                text: 'text-yellow-600 dark:text-yellow-400',
                iconBg: 'bg-yellow-100 dark:bg-yellow-500/20',
                iconColor: 'text-yellow-600 dark:text-yellow-400',
                badgeBg: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20',
                progressBar: 'bg-yellow-500',
                riskLevel: 'Medium'
            };
        } else {
            return {
                level: 'Low',
                bg: 'bg-green-50 dark:bg-green-500/10',
                border: 'border-green-100 dark:border-green-500/20',
                text: 'text-green-600 dark:text-green-400',
                iconBg: 'bg-green-100 dark:bg-green-500/20',
                iconColor: 'text-green-600 dark:text-green-400',
                badgeBg: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20',
                progressBar: 'bg-green-500',
                riskLevel: 'Low'
            };
        }
    };

    const riskInfo = getRiskInfo();

    // Get inheritance pattern
    const getInheritancePattern = () => {
        if (diseaseData.name.includes('Glioma') || diseaseData.name.includes('Diabetes')) {
            return "Complex/Multifactorial";
        }
        if (diseaseData.name.includes('Endometriosis') || diseaseData.name.includes('Glaucoma')) {
            return "Polygenic Inheritance";
        }
        if (diseaseData.name.includes('Suicide')) {
            return "Gene-Environment Interaction";
        }
        return "Complex Inheritance";
    };

    const handleDownloadPDF = async () => {
        setGeneratingPDF(true);
        try {
            await generatePDF(diseaseData);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Could not generate PDF. Please try again.');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const handleDownloadTextReport = async () => {
        setGeneratingText(true);
        try {
            generateTextReport(diseaseData);
        } catch (error) {
            console.error('Failed to generate text report:', error);
        } finally {
            setGeneratingText(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[80vh] bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 transition-colors duration-300 print:bg-white print:py-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header with action buttons */}
                    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 print:hidden">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleDownloadTextReport}
                                disabled={generatingText}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generatingText ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FileText className="w-4 h-4" />
                                )}
                                Text Report
                            </button>

                            <button
                                onClick={printReport}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>

                            <button
                                onClick={handleDownloadPDF}
                                disabled={generatingPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generatingPDF ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Main Report Card */}
                    <motion.div
                        id="clinical-report"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 print:shadow-none print:border print:rounded-none"
                    >
                        {/* Report Header */}
                        <div className="print:hidden bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-center">
                            <div className="text-white text-sm font-bold uppercase tracking-widest">
                                Genomic Analysis Report
                            </div>
                        </div>

                        {/* Patient & Report Info */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 print:py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Patient ID</div>
                                        <div className="font-mono font-bold">PAT-{Date.now().toString().slice(-8)}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Report Date</div>
                                        <div className="font-bold">{new Date().toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Confidentiality</div>
                                        <div className="font-bold">Level 3 - Protected</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Banner */}
                        <div className={`p-8 border-b ${riskInfo.bg} ${riskInfo.border} print:py-6`}>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${riskInfo.iconBg}`}>
                                    <AlertTriangle className={`w-8 h-8 ${riskInfo.iconColor}`} />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-bold uppercase tracking-wider text-sm mb-1 ${riskInfo.text}`}>
                                        {riskInfo.level} RISK DETECTED
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 print:text-2xl">
                                        {diseaseData.name}
                                    </h1>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Comprehensive Genomic Analysis Report • Version 1.0
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Confidence Score</div>
                                    <div className="text-4xl font-bold text-slate-900 dark:text-white print:text-3xl">
                                        {diseaseData.confidence.toFixed(1)}%
                                    </div>
                                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                                        <div
                                            className={`h-full ${riskInfo.progressBar}`}
                                            style={{ width: `${Math.min(diseaseData.confidence, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="p-8 print:py-6">
                            {/* Clinical Interpretation - Full width */}
                            <div className="mb-8 print:gap-6">
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 print:bg-white print:border">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 print:text-lg">
                                        <Info className="w-5 h-5 text-blue-500" />
                                        Clinical Interpretation & Disease Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="prose prose-slate dark:prose-invert max-w-none">
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 whitespace-pre-line text-sm">
                                                {getEnhancedDescription(diseaseData.name)}
                                            </p>

                                            {/* Additional Genetic Context */}
                                            <div className="mt-6 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Dna className="w-4 h-4 text-purple-500" />
                                                    Genetic Context & Inheritance Pattern
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Likely Inheritance</div>
                                                        <div className="text-slate-600 dark:text-slate-400">
                                                            {getInheritancePattern()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Risk Stratification</div>
                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${riskInfo.badgeBg}`}>
                                                            {riskInfo.level} Risk Category
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Limitations */}
                            <div className="mb-8">
                                <div className="bg-red-50 dark:bg-red-500/5 p-6 rounded-xl border border-red-100 dark:border-red-500/10 print:bg-white print:border">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 print:text-base">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        Test Limitations
                                    </h4>
                                    <ul className="space-y-2 text-sm text-red-800 dark:text-red-400">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                            <span>This test does not detect all possible genetic variants</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                            <span>Results should be interpreted in clinical context</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                            <span>Negative result does not rule out genetic predisposition</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                            <span>Consult with genetics professional for interpretation</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    <p className="mb-2">
                                        <strong>Disclaimer:</strong> This report is intended for use by qualified healthcare professionals only.
                                    </p>
                                    <p>
                                        <strong>Interpretation Guideline:</strong> Based on ACMG/AMP Standards and Guidelines.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white mb-1">
                                            Report Generated
                                        </div>
                                        <div className="text-slate-600 dark:text-slate-400">
                                            {new Date().toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white mb-1">
                                            Report ID
                                        </div>
                                        <div className="font-mono text-slate-600 dark:text-slate-400">
                                            {diseaseData.id?.toUpperCase() || 'GLIOMA'}-{Date.now().toString().slice(-6)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Report generated on {new Date().toLocaleDateString()}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/results')}
                                className="px-6 py-3 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 font-medium"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                Back to Results
                            </button>

                            <button
                                onClick={() => navigate('/diagnose')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium group"
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                New Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}