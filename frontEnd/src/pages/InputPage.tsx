import type React from "react"
import { useState } from "react"
import { Send, AlertCircle, Terminal, FileCode } from "lucide-react"
import Layout from "../components/layout/Layout"
import AnalysisView from "../components/diagnose/AnalysisView"
import { AnimatePresence, motion } from "framer-motion"

const exampleMutations = ["rs7034200-A", "rs74577409-G", "rs10069690-T", "rs9967620-C", "rs6547692-A"]

export default function InputPage() {
    const [mutations, setMutations] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mutations.trim()) { setError("Please enter at least one mutation"); return }

        const mutationList = mutations.split("\n").map((m) => m.trim()).filter((m) => m.length > 0)
        if (mutationList.length === 0) { setError("Please enter valid mutations"); return }

        setError(""); setLoading(true)

        try {
            const response = await fetch("https://diseases-detection-wdqcoa.fly.dev/api/predict/list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ snp_list: mutationList })
            })

            const data = await response.json()
            if (!response.ok) { throw new Error(data.error || "Prediction failed") }

            sessionStorage.setItem('predictionResult', JSON.stringify(data))
            window.location.href = '/results'
        } catch (err: any) {
            setError(err.message || 'Connection failed. Is the backend running?')
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-[80vh] bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 transition-colors duration-300">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center pt-12 sm:pt-20"
                        >
                            <AnalysisView />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="text-center mb-8 sm:mb-12">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Genome Input</h1>
                                <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                                    Enter SNPs (one per line) to detect potential genetic risks using our AI model.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                {/* Input Column */}
                                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg transition-colors duration-300">
                                        <div className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">mutations_input.txt</span>
                                        </div>

                                        <form onSubmit={handleSubmit} className="p-1">
                                            <textarea
                                                value={mutations}
                                                onChange={(e) => { setMutations(e.target.value); setError("") }}
                                                placeholder="// Enter SNPs (one per line)&#10;rs1333049-A&#10;rs2519203-T"
                                                className="w-full h-64 sm:h-80 bg-slate-50 dark:bg-[#0b1120] text-cyan-700 dark:text-cyan-300 font-mono text-sm p-4 focus:outline-none resize-none placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                                            />

                                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors duration-300">
                                                <span className="text-xs text-slate-600 dark:text-slate-500">
                                                    {mutations.split('\n').filter(x => x.trim()).length} SNPs detected
                                                </span>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                                >
                                                    {loading ? <span className="animate-spin">⏳</span> : <Send className="w-4 h-4" />}
                                                    {loading ? "Processing DNA..." : "Analyze Genome"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {error && (
                                        <div className="bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm transition-colors duration-300">
                                            <AlertCircle className="w-5 h-5" /> {error}
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Column */}
                                <div className="space-y-6">
                                    <div className="bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
                                        <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-medium">
                                            <FileCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            <span>Quick Load</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-400 mb-4">Click to load sample data for testing:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {exampleMutations.map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => { setMutations(prev => prev ? prev + "\n" + m : m); setError("") }}
                                                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-700 dark:text-slate-300 text-xs font-mono rounded-md transition-all"
                                                >
                                                    + {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-500/10 p-6 transition-colors duration-300">
                                        <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2 text-sm">Supported Formats</h3>
                                        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-400">
                                            <li className="flex gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5"></span>
                                                <span><strong>rsID:</strong> The most common format (e.g., <code className="text-cyan-600 dark:text-cyan-300">rs1333049-G</code>)</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    )
}
