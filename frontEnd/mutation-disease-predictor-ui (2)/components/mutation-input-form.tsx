"use client"

import type React from "react"
import { Send, AlertCircle } from "lucide-react"

interface MutationInputFormProps {
  mutations: string
  error: string
  loading: boolean
  onMutationsChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  exampleMutations: string[]
  onLoadExamples: () => void
}

export function MutationInputForm({
  mutations,
  error,
  loading,
  onMutationsChange,
  onSubmit,
  exampleMutations,
  onLoadExamples,
}: MutationInputFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2 pb-6 border-b border-border">
        <label htmlFor="mutations" className="block text-lg font-semibold text-foreground">
          Enter Your Genetic Mutation(s)
        </label>
        <p className="text-muted-foreground">
          Input mutations in rsID (e.g., rs1333049) or HGVS format (e.g., NM_007300.4:c.1687C&gt;T). One per line.
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          id="mutations"
          value={mutations}
          onChange={(e) => onMutationsChange(e.target.value)}
          placeholder="e.g., rs1333049&#10;rs2519203&#10;rs10811661"
          className="w-full h-48 px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-foreground placeholder-muted-foreground"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <p className="text-sm font-medium text-foreground mb-3">Example Mutations:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {exampleMutations.map((mutation) => (
            <span
              key={mutation}
              className="px-3 py-1 bg-background border border-border rounded-full text-sm text-foreground"
            >
              {mutation}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onLoadExamples}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Load Examples
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-4 bg-primary hover:bg-opacity-90 disabled:opacity-60 text-primary-foreground rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Predict Disease
          </>
        )}
      </button>
    </form>
  )
}
