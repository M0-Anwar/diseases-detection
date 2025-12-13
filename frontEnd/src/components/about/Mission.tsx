import { motion } from 'framer-motion';
import { Target, HeartPulse, Globe2 } from 'lucide-react';

export default function Mission() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                        Our Mission
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                        Democratizing Access to <br />
                        <span className="text-primary">Precision Medicine</span>
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        We are dedicated to bridging the gap between complex genomic data and actionable clinical insights. By harnessing the power of artificial intelligence, we aim to make early genetic disease detection accessible, accurate, and efficient for everyone.
                    </p>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Target className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Precision</h3>
                                <p className="text-sm text-slate-600">Reducing false positives through advanced deep learning architectures.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <HeartPulse className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Patient-Centric</h3>
                                <p className="text-sm text-slate-600">Designed to support earlier interventions and better health outcomes.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Globe2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Universal Access</h3>
                                <p className="text-sm text-slate-600">Scalable technology adaptable to diverse genetic populations.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Abstract representation of mission */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 border border-white/10 rounded-full animate-spin-slow-reverse opacity-30" />
                        <div className="w-1/2 h-1/2 border border-white/20 rounded-full animate-spin-slow opacity-50 absolute" />
                        <div className="relative z-10 text-center">
                            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                                AI + DNA
                            </div>
                            <div className="text-white/60 text-sm tracking-widest uppercase">The Future of Medicine</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
