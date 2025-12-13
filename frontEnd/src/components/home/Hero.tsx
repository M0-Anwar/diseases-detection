import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Activity } from 'lucide-react';
import { useRef } from 'react';

// Placeholder for DNA Animation using CSS/SVG since we don't have a Lottie file yet
const DNAAnimation = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow opacity-80">
            <defs>
                <linearGradient id="dna-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            <path
                d="M100,20 C140,20 160,60 160,100 C160,140 140,180 100,180 C60,180 40,140 40,100 C40,60 60,20 100,20 Z"
                fill="none"
                stroke="url(#dna-gradient)"
                strokeWidth="4"
                className="opacity-50"
            />
            <circle cx="100" cy="100" r="60" stroke="#14b8a6" strokeWidth="2" fill="none" strokeDasharray="10 10" />
            <path
                d="M100,40 Q130,100 100,160 M100,40 Q70,100 100,160"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary"
            />
        </svg>
        <div className="absolute animate-pulse">
            <Activity className="w-16 h-16 text-primary" />
        </div>
    </div>
);

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);

    return (
        <section ref={containerRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-slate-50 to-white">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-50" />
                <motion.div style={{ y: y1 }} className="absolute top-20 right-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
                <motion.div style={{ y: y2 }} className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-medium border border-blue-200">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Next-Gen Genetic Analysis
                    </div>

                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                        AI-Driven <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                            Genetic Disease
                        </span> <br />
                        Detection
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                        Leveraging advanced artificial intelligence to analyze genetic sequences and predict inherited conditions with medical-grade accuracy.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                            to="/diagnose"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all bg-primary rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-primary/30 hover:-translate-y-1 group"
                        >
                            Start Genetic Analysis
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/description"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 transition-all bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md"
                        >
                            Learn How It Works
                        </Link>
                    </div>

                    <div className="pt-8 flex items-center gap-8 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            99.8% Accuracy
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            HIPAA Compliant
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-500" />
                            Instant Results
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative h-[600px] hidden lg:block"
                >
                    {/* 3D Parallax Effect Container */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Main Visual - Simulating SVG/Lottie */}
                        <div className="relative w-full h-full max-w-md aspect-square bg-gradient-to-br from-white to-blue-50 rounded-[2rem] shadow-2xl border border-white/50 backdrop-blur-sm p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <DNAAnimation />

                            {/* Floating Cards */}
                            <motion.div
                                className="absolute -right-12 top-20 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 z-20"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Activity className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Analysis Status</div>
                                    <div className="text-sm font-bold text-slate-900">Processing...</div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="absolute -left-8 bottom-32 bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-100 z-20"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-xs font-semibold text-slate-700">Mutation Detected</span>
                                </div>
                                <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-red-500 rounded-full" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
