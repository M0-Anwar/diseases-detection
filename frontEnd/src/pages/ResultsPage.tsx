import { useEffect, useState } from "react"
import { Loader2, ChevronDown, ChevronUp, ArrowRight, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

type Disease = {
  id: string
  name: string
  confidence: number
  mutations: string[]
  pathogenicity: "High" | "Medium" | "Low"
  description: string
  references: string[]
}

export default function ResultsContent() {
  const [results, setResults] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setResults([]); // تصفير النتائج القديمة
    
    try {
      const stored = sessionStorage.getItem('predictionResult')
      
      if (stored) {
        const parsed = JSON.parse(stored)
        const preds = parsed.predictions || {}

        const resultsArr: Disease[] = Object.entries(preds).map(([disease, info]: [string, any]) => {
          // حساب النسبة
          let prob = 0;
          if (info?.probability) prob = Number(info.probability);
          else if (info?.percentage) prob = Number(String(info.percentage).replace('%', '')) / 100;

          const percentage = prob * 100
          
          // تحديد مستوى الخطورة
          let risk = info?.risk_level;
          if (!risk) {
             if (prob > 0.7) risk = 'High';
             else if (prob > 0.5) risk = 'Medium';
             else risk = 'Low'; // وهذا ما سنقوم بفلترته
          }

          return {
            id: disease,
            name: disease,
            confidence: percentage,
            mutations: info?.mutations || [],
            pathogenicity: risk as "High" | "Medium" | "Low",
            description: info?.description || `Model probability: ${(prob * 100).toFixed(2)}%`,
            references: info?.references || []
          }
        });

        // =====================================================================
        // 🔥 التعديل الأهم: محاكاة منطق التيرمينال
        // الموديل بيوزع الـ 100% على الـ 5 أمراض لو المدخلات غلط (كل واحد بياخد 20%)
        // عشان كده بنقوله: أي حاجة أقل من 50% اعتبرها "ولا حاجة" وماتعرضهاش
        // =====================================================================
        const validResults = resultsArr.filter(result => result.confidence >= 50.0);

        setResults(validResults.sort((a, b) => b.confidence - a.confidence));
        
      } else {
        setResults([])
      }
    } catch (e) {
      console.error('Error reading predictionResult from sessionStorage', e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleViewDetails = (disease: Disease) => {
    navigate(`/mutation-detail/${encodeURIComponent(disease.id)}`, { 
      state: { diseaseData: disease } 
    });
  }

  const downloadCSV = () => {
    const csvHeader = ["Disease Name", "Pathogenicity", "Confidence (%)", "Description"];
    const csvRows = results.map(r => [
      `"${r.name}"`,
      r.pathogenicity,
      r.confidence.toFixed(2),
      `"${r.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [csvHeader.join(","), ...csvRows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "genome_analysis_results.csv"
    a.click()
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-white">
        <Loader2 className="animate-spin w-10 h-10 mx-auto text-blue-500" />
        <p className="mt-4 text-lg">Processing genome data...</p>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8 text-center border-b border-gray-700 pb-4">
        Prediction Results
      </h1>

      {/* الحالة: القائمة فارغة (سواء كان سليم أو دخل ss) */}
      {results.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700 shadow-xl px-6">
          <div className="inline-block p-4 rounded-full bg-gray-700/50 mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No Diseases Detected</h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
            Patient appears healthy based on the provided genetic markers.
            <br/><span className="text-sm text-gray-500 mt-2 block">(Invalid or unrecognized SNPs are ignored)</span>
          </p>
          <button 
            onClick={() => navigate('/input')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Run New Analysis
          </button>
        </div>
      ) : (
        // الحالة: تم اكتشاف مرض بنسبة خطورة عالية (أكبر من 50%)
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-200 border ${
                result.pathogenicity === 'High' ? 'border-red-500/50' : 'border-gray-700'
              }`}
            >
              <div 
                className="p-5 cursor-pointer hover:bg-gray-750 flex justify-between items-center"
                onClick={() => toggleExpand(result.id)}
              >
                <div>
                  <h2 className="text-xl font-bold text-blue-100">{result.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className={`px-2 py-0.5 rounded-full ${
                      result.pathogenicity === 'High' ? 'bg-red-900 text-red-200' :
                      result.pathogenicity === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-green-900 text-green-200'
                    }`}>
                      {result.pathogenicity} Risk
                    </span>
                    <span className="text-gray-400">
                      Confidence: <span className="text-white font-mono">{result.confidence.toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
                {expandedId === result.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </div>

              {expandedId === result.id && (
                <div className="px-5 pb-5 pt-2 bg-gray-750/50 border-t border-gray-700">
                  <p className="text-gray-300 mb-4 leading-relaxed">{result.description}</p>
                  
                  {result.mutations.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Mutations:</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.mutations.slice(0, 5).map((m, index) => (
                          <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs font-mono text-blue-300">
                            {m}
                          </span>
                        ))}
                        {result.mutations.length > 5 && (
                          <span className="text-xs text-gray-500 self-center">+{result.mutations.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(result);
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-1"
                    >
                      View Full Report <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button
            onClick={downloadCSV}
            className="mt-8 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-semibold w-full transition-colors flex items-center justify-center gap-2"
          >
            Download Results as CSV
          </button>
        </div>
      )}
    </div>
  )
}