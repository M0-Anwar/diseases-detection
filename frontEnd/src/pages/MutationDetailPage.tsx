"use client"

import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ExternalLink, Dna, Info } from "lucide-react"

interface MutationDetail {
  id: string
  diseaseName: string
  mutations: {
    name: string
    rsId: string
    gene: string
    chromosome: string
    position: string
    pathogenicity: string
    alleleFreq: string
    description: string
  }[]
  clinicalSignificance: string
  inheritance: string
  references: {
    title: string
    pmid: string
    url: string
  }[]
  externalLinks: {
    name: string
    url: string
  }[]
}

// بيانات فارغة تماماً للاحتياط
const emptyMutationData: MutationDetail = {
  id: "unknown",
  diseaseName: "Unknown Condition",
  mutations: [],
  clinicalSignificance: "No data available.",
  inheritance: "Unknown",
  references: [],
  externalLinks: []
}

export default function MutationDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  
  const [data, setData] = useState<MutationDetail | null>(null)

  useEffect(() => {
    // التحقق مما إذا كانت البيانات قادمة من صفحة النتائج
    if (location.state?.diseaseData) {
      const passedData = location.state.diseaseData;
      
      // تعبئة البيانات مباشرة من الموديل فقط دون إضافة بيانات خارجية
      const directMutations = passedData.mutations.map((mutString: string) => {
        return {
          name: mutString,        // اسم الطفرة كما جاء من الموديل
          rsId: mutString,        // نستخدم نفس الاسم كـ ID
          gene: "-",              // الموديل لا يرسل الجين
          chromosome: "-",        // الموديل لا يرسل الكروموسوم
          position: "-",          // الموديل لا يرسل الموقع
          pathogenicity: passedData.pathogenicity, // نأخذ خطورة المرض نفسه
          alleleFreq: "-",        // غير متوفر من الموديل
          description: "-"        // غير متوفر من الموديل
        };
      });

      const formattedData: MutationDetail = {
        id: passedData.id,
        diseaseName: passedData.name,
        mutations: directMutations,
        clinicalSignificance: passedData.description || "No description provided by model.",
        inheritance: "See clinical references", 
        // عرض المراجع فقط إذا أرسلها الموديل
        references: passedData.references && Array.isArray(passedData.references)
          ? passedData.references.map((ref: string, idx: number) => ({
              title: ref,
              pmid: `-`,
              url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(ref)}` // رابط بحث بسيط
            }))
          : [],
        externalLinks: [
          // روابط بحث عامة فقط باستخدام اسم المرض القادم من الموديل
          { name: `Search Google for ${passedData.name}`, url: `https://www.google.com/search?q=${passedData.name}` },
          { name: "ClinVar Search", url: "https://www.ncbi.nlm.nih.gov/clinvar/" }
        ]
      };
      
      setData(formattedData);
    } 
    else {
      setData(emptyMutationData);
    }
  }, [id, location.state]);

  if (!data) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                Loading...
            </div>
        </div>
    )
  }

  if (data.id === "unknown") {
      return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <Info className="w-16 h-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Data Found</h1>
            <p className="text-gray-400 mb-6 text-center max-w-md">
                Please perform a new analysis to view detailed results.
            </p>
            <Link to="/input" className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Start Analysis
            </Link>
        </main>
      )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <Dna className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Mutation Report</h1>
              <p className="text-sm text-blue-300 font-medium">{data.diseaseName}</p>
            </div>
          </div>
          
          <Link
            to="/results"
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all text-sm font-medium text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Results
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">Risk Level</p>
                <div className={`text-2xl font-bold ${
                    data.mutations[0]?.pathogenicity === 'High' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                    {data.mutations[0]?.pathogenicity || 'Unknown'}
                </div>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl md:col-span-2">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">Model Description</p>
                <p className="text-gray-200 leading-relaxed">{data.clinicalSignificance}</p>
            </div>
        </div>

        {/* Mutations Table */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            Identified Genetic Variants (Model Output)
          </h3>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-300">Variant ID</th>
                    {/* تم الإبقاء على الأعمدة لكن البيانات ستكون فارغة لعدم توفرها من الموديل */}
                    <th className="px-6 py-4 font-semibold text-gray-300">Gene</th>
                    <th className="px-6 py-4 font-semibold text-gray-300">Locus</th>
                    <th className="px-6 py-4 font-semibold text-gray-300">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.mutations.map((mut, i) => (
                    <tr key={i} className="hover:bg-gray-700/30 transition-colors group">
                      <td className="px-6 py-4">
                          <div className="font-mono text-blue-400 font-bold">{mut.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                          {mut.gene}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono">
                        {mut.chromosome}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            mut.pathogenicity === 'High' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 
                            mut.pathogenicity === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' : 
                            'bg-green-900/30 text-green-400 border border-green-900/50'
                        }`}>
                          {mut.pathogenicity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* References & Links (Only if model provided them) */}
        <div className="grid md:grid-cols-2 gap-8">
            {data.references.length > 0 && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-gray-400"/>
                        Model References
                    </h3>
                    <ul className="space-y-3">
                        {data.references.map((ref, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                            <span className="text-gray-500 mt-1">[{i+1}]</span>
                            <a href={ref.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                                {ref.title}
                            </a>
                        </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">External Resources</h3>
                <div className="grid gap-3">
                    {data.externalLinks.map((link, i) => (
                    <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-700/30 hover:bg-gray-700 rounded-lg transition-all group border border-transparent hover:border-blue-500/30"
                    >
                        <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                        {link.name}
                        </span>
                        <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </a>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </main>
  )
}