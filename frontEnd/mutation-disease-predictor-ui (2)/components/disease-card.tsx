"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface Disease {
  id: string
  name: string
  confidence: number
  mutations: string[]
  pathogenicity: "High" | "Medium" | "Low"
  description: string
  references: string[]
}

export function DiseaseCard({ disease }: { disease: Disease }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">{disease.name}</h3>
              <div className="flex items-center gap-4 flex-wrap">
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
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
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
          className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="px-6 py-6 border-t border-border bg-muted/20 space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Overview</h4>
            <p className="text-muted-foreground">{disease.description}</p>
          </div>

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

          <Link
            href={`/mutation-detail/${disease.id}`}
            className="inline-block px-4 py-2 bg-primary hover:bg-opacity-90 text-primary-foreground rounded-lg font-medium transition-all"
          >
            View Full Details
          </Link>
        </div>
      )}
    </div>
  )
}
