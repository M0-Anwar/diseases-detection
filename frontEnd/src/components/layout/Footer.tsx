import { Link } from 'react-router-dom';
import { Dna, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Dna className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">GeneDetect AI</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Empowering healthcare through advanced AI-driven genetic analysis.
                            Reliable, secure, and precise detection of hereditary conditions.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/description" className="hover:text-primary transition-colors">How it Works</Link></li>
                            <li><Link to="/diagnose" className="hover:text-primary transition-colors">Start Diagnosis</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">Research Team</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Legal & Privacy</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Medical Disclaimer</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Data Security</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Contact</h3>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Cairo University, Faculty of Computers and AI.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
                                <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
                                <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Mail className="w-5 h-5" /></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 mt-12 pt-8 text-center text-sm text-slate-500">
                    <p>© {currentYear} GeneDetect AI. For educational and research purposes only.</p>
                    <p className="mt-2 text-xs text-slate-400 uppercase tracking-wider">Not for clinical use without verification</p>
                </div>
            </div>
        </footer>
    );
}
