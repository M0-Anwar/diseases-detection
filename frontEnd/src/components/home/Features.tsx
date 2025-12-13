import { motion } from 'framer-motion';
import { Zap, ShieldCheck, FileText } from 'lucide-react';

const features = [
    {
        icon: ShieldCheck,
        title: "High Accuracy Prediction",
        description: "Powered by state-of-the-art deep learning models trained on extensive genomic datasets to ensure precise mutation detection.",
        color: "bg-blue-50 text-blue-600"
    },
    {
        icon: Zap,
        title: "Fast Genetic Analysis",
        description: "Get comprehensive results in seconds. Our optimized inference engine processes sequencing data near-instantly.",
        color: "bg-amber-50 text-amber-600"
    },
    {
        icon: FileText,
        title: "Clear Medical Reports",
        description: "Receive detailed, easy-to-understand reports suitable for both clinical review and patient education.",
        color: "bg-green-50 text-green-600"
    }
];

export default function Features() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="group p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
