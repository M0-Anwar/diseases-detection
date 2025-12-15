import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Dna, FileText, Info, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ThemeToggle';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navItems = [
        { name: 'Home', path: '/', icon: Activity },
        { name: 'Description', path: '/description', icon: FileText },
        { name: 'Education', path: '/education', icon: Dna },
        { name: 'About', path: '/about', icon: Info },
        { name: 'Diagnose', path: '/diagnose', icon: Activity },
    ];

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
                    isScrolled
                        ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-800 py-3 shadow-sm"
                        : "bg-transparent border-transparent py-5"
                )}
            >
                <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group z-50">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Dna className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                            GeneDetect AI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-2 text-sm font-medium transition-colors relative py-1",
                                        isActive
                                            ? "text-primary"
                                            : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            to="/diagnose"
                            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white px-5 py-2 rounded-full text-sm font-semiboldtransition-all hover:shadow-lg hover:shadow-primary/20"
                            >
                            Start Analysis
                        </Link>
                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-slate-900 dark:text-white" />
                            ) : (
                                <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-slate-900 shadow-2xl z-50 md:hidden overflow-y-auto"
                        >
                            <div className="pt-24 px-6 pb-8">
                                <nav className="space-y-2">
                                    {navItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                )}
                                            >
                                                <Icon className="w-5 h-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <Link
                                        to="/diagnose"
                                        className="flex items-center justify-center gap-2 w-full bg-primary text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg"
                                    >
                                        <Activity className="w-5 h-5" />
                                        Start Analysis
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
