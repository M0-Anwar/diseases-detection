import { useEffect, useState } from "react";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

type Disease = {
  id: string;
  name: string;
  confidence: number;
  mutations: string[];
  pathogenicity: "High" | "Medium" | "Low";
  description: string;
  references: string[];
};

export default function ResultsPage() {
  const [results, setResults] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Helper function to determine color based on confidence
  const getColorClasses = (confidence: number) => {
    if (confidence >= 75) {
      return {
        border: "border-red-300 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/50 shadow-lg",
        tag: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/20",
        progress: "bg-red-500",
        pathogenicity: "High" as const
      };
    } else if (confidence >= 55) {
      return {
        border: "border-yellow-300 dark:border-yellow-500/30 hover:border-yellow-400 dark:hover:border-yellow-500/50 shadow-lg",
        tag: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500/20",
        progress: "bg-yellow-500",
        pathogenicity: "Medium" as const
      };
    } else {
      return {
        border: "border-green-300 dark:border-green-500/30 hover:border-green-400 dark:hover:border-green-500/50 shadow-lg",
        tag: "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/20",
        progress: "bg-green-500",
        pathogenicity: "Low" as const
      };
    }
  };

  useEffect(() => {
    setResults([]);
    setError(null);

    try {
      const stored = sessionStorage.getItem("predictionResult");

      if (!stored) {
        throw new Error("NO_DATA");
      }

      const parsed = JSON.parse(stored);
      const preds = parsed.predictions;

      if (!preds || Object.keys(preds).length === 0) {
        throw new Error("EMPTY_RESULTS");
      }

      const resultsArr: Disease[] = Object.entries(preds).map(
        ([disease, info]: [string, any]) => {
          const prob = info?.probability
            ? Number(info.probability)
            : info?.percentage
            ? Number(String(info.percentage).replace("%", "")) / 100
            : 0;

          const confidence = prob * 100;
          const colorClasses = getColorClasses(confidence);

          return {
            id: disease,
            name: disease,
            confidence: confidence,
            mutations: info?.mutations || [],
            pathogenicity: colorClasses.pathogenicity,
            description:
              info?.description ||
              `Model confidence ${(prob * 100).toFixed(2)}%`,
            references: info?.references || [],
          };
        }
      );

      const validResults = resultsArr.filter((r) => r.confidence >= 50);
      setResults(validResults.sort((a, b) => b.confidence - a.confidence));
    } catch (err: any) {
      console.error(err);

      if (err.message === "NO_DATA") {
        setError(
          "Unable to retrieve analysis results. The server may be unreachable or blocked by your browser."
        );
      } else {
        setError(
          "An unexpected error occurred while processing the analysis results."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400 transition-colors duration-300">
          <Loader2 className="animate-spin w-12 h-12 mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-mono tracking-widest animate-pulse">
            ANALYZING GENOME SEQUENCE...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <Activity className="w-8 h-8 text-cyan-500" /> Analysis Report
            </h1>
            {results.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    High (≥75%)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Medium (74-55%)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                      Low (≤50%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {error ? (
            <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/20 rounded-2xl p-10 text-center shadow-lg">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Analysis Failed
              </h2>
              <p className="text-slate-700 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm sm:text-base">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/diagnose")}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg transition-all text-sm font-semibold"
                >
                  Retry Analysis
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-all text-sm"
                >
                  Reload Page
                </button>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-12 text-center shadow-lg">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No Significant Genetic Risks
              </h2>
              <p className="text-slate-700 dark:text-slate-400 max-w-lg mx-auto mb-6 text-sm sm:text-base">
                (Unrecognized SNPs or low probability results are filtered out)
              </p>
              <button
                onClick={() => navigate("/diagnose")}
                className="px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Analyze New Sample
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {results.map((result) => {
                const colorClasses = getColorClasses(result.confidence);

                return (
                  <div
                    key={result.id}
                    className={`group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border transition-all duration-300 ${colorClasses.border}`}
                  >
                    <div
                      className="p-4 sm:p-6 cursor-pointer"
                      onClick={() =>
                        setExpandedId(
                          expandedId === result.id ? null : result.id
                        )
                      }
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 sm:gap-0">
                        <div className="flex-1">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {result.name}
                          </h2>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClasses.tag}`}
                            >
                              {result.pathogenicity} Risk
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${colorClasses.progress}`}
                                  style={{ width: `${result.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                                {result.confidence.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {expandedId === result.id ? (
                          <ChevronUp className="text-slate-500 dark:text-slate-400" />
                        ) : (
                          <ChevronDown className="text-slate-500 dark:text-slate-400" />
                        )}
                      </div>

                      {expandedId === result.id && (
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                          <p className="text-slate-700 dark:text-slate-400 mb-6 leading-relaxed">
                            {result.description}
                          </p>
                          {result.mutations.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-500 uppercase tracking-widest mb-3">
                                Detected Markers
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {result.mutations.slice(0, 5).map((m, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-cyan-700 dark:text-cyan-300"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/mutation-detail/${encodeURIComponent(
                                  result.id
                                )}`,
                                { state: { diseaseData: result } }
                              );
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500/50 text-slate-900 dark:text-white px-4 py-3 rounded-xl transition-all font-medium"
                          >
                            View Clinical Report <ArrowRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}