"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, ChevronDown, Dna } from "lucide-react"
import { Suspense } from "react"

interface Disease {
  id: string
  name: string
  confidence: number
  mutations: string[]
  pathogenicity: "High" | "Medium" | "Low"
  description: string
  references: string[]
}

const mockResults: Disease[] = [
  {
    id: "disease-1",
    name: "Coronary Artery Disease",
    confidence: 92,
    mutations: ["rs1333049", "rs1342326"],
    pathogenicity: "High",
    description: "Increased risk of coronary artery disease associated with variants in the 9p21 region.",
    references: ["PMID: 17554300", "ClinVar: RCV000001234"],
  },
  {
    id: "disease-2",
    name: "Diabetes Type 2",
    confidence: 78,
    mutations: ["rs2519203", "rs10811661"],
    pathogenicity: "Medium",
    description: "Associated with increased fasting glucose levels and diabetes risk.",
    references: ["PMID: 17534267", "ClinVar: RCV000005678"],
  },
  {
    id: "disease-3",
    name: "Myocardial Infarction",
    confidence: 85,
    mutations: ["rs1333049", "rs1837461"],
    pathogenicity: "High",
    description: "Variants linked to increased risk of early-onset myocardial infarction.",
    references: ["PMID: 17554301", "GWAS: hg38/chr9:22000001-22500000"],
  },
]

function ResultsContent() {
  const searchParams = useSearchParams()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mutations, setMutations] = useState<string[]>([])

  useEffect(() => {
    const mutationsParam = searchParams.get("mutations")
    if (mutationsParam) {
      try {
        setMutations(JSON.parse(mutationsParam))
      } catch (e) {
        console.error("Failed to parse mutations:", e)
      }
    }
  }, [searchParams])

  const handleDownloadCSV = () => {
    const csv = [
      ["Disease", "Confidence", "Pathogenicity", "Associated Mutations", "Description"],
      ...mockResults.map((d) => [d.name, `${d.confidence}%`, d.pathogenicity, d.mutations.join(";"), d.description]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "disease-predictions.csv"
    a.click()
  }

  const handleDownloadPDF = () => {
    alert("PDF download would be generated here. This is a demo functionality.")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted pb-12">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Dna className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Analysis Results</h1>
          </div>
          <Link href="/input" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            New Analysis
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Input Summary */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">Analyzed Mutations</h2>
          <div className="flex flex-wrap gap-2">
            {mutations.length > 0 ? (
              mutations.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
                >
                  {m}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">No mutations provided</span>
            )}
          </div>
        </div>

        {/* Download Options */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-background border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Download className="w-5 h-5" />
            Download CSV
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-background border-2 border-secondary text-secondary rounded-lg font-medium hover:bg-secondary hover:text-secondary-foreground transition-all"
          >
            <Download className="w-5 h-5" />
            Download PDF Report
          </button>
        </div>

        {/* Disease Predictions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Predicted Diseases</h2>

          {mockResults.map((disease) => (
            <div
              key={disease.id}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header - Always Visible */}
              <button
                onClick={() => setExpandedId(expandedId === disease.id ? null : disease.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{disease.name}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                              style={{ width: `${disease.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">{disease.confidence}%</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            disease.pathogenicity === "High"
                              ? "bg-destructive/20 text-destructive"
                              : disease.pathogenicity === "Medium"
                                ? "bg-accent/20 text-accent"
                                : "bg-secondary/20 text-secondary"
                          }`}
                        >
                          {disease.pathogenicity} Pathogenicity
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    expandedId === disease.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Card Content - Expandable */}
              {expandedId === disease.id && (
                <div className="px-6 py-6 border-t border-border bg-muted/20 space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Overview</h4>
                    <p className="text-muted-foreground">{disease.description}</p>
                  </div>

                  {/* Associated Mutations */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Associated Mutations</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {disease.mutations.map((mut) => (
                        <span
                          key={mut}
                          className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground text-center"
                        >
                          {mut}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* References */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">References</h4>
                    <ul className="space-y-2">
                      {disease.references.map((ref, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-semibold mt-0.5">•</span>
                          <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                            {ref}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Details Button */}
                  <Link
                    href={`/mutation-detail/${disease.id}`}
                    className="inline-block px-4 py-2 bg-primary hover:bg-opacity-90 text-primary-foreground rounded-lg font-medium transition-all"
                  >
                    View Full Details
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  )
}
