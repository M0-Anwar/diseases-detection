"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Send, AlertCircle, Dna } from "lucide-react"

const exampleMutations = ["rs1333049", "rs2519203", "rs10811661", "rs1342326", "rs1837461"]

export default function InputPage() {
  const navigate = useNavigate()
  const [mutations, setMutations] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!mutations.trim()) {
      setError("Please enter at least one mutation")
      return
    }

    const mutationList = mutations
      .split("\n")
      .map((m) => m.trim())
      .filter((m) => m.length > 0)

    if (mutationList.length === 0) {
      setError("Please enter valid mutations")
      return
    }

    setError("")
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      navigate(`/results?mutations=${JSON.stringify(mutationList)}`)
    }, 1500)
  }

  const addExampleMutations = () => {
    setMutations(exampleMutations.join("\n"))
    setError("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Dna className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mutation Analyzer</h1>
          </div>
          <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title and Description */}
            <div className="space-y-2 pb-6 border-b border-border">
              <label htmlFor="mutations" className="block text-lg font-semibold text-foreground">
                Enter Your Genetic Mutation(s)
              </label>
              <p className="text-muted-foreground">
                Input mutations in rsID (e.g., rs1333049) or HGVS format (e.g., NM_007300.4:c.1687C&gt;T). One per line.
              </p>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <textarea
                id="mutations"
                value={mutations}
                onChange={(e) => {
                  setMutations(e.target.value)
                  setError("")
                }}
                placeholder="e.g., rs1333049&#10;rs2519203&#10;rs10811661"
                className="w-full h-48 px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Example Mutations */}
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
                onClick={addExampleMutations}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Load Examples
              </button>
            </div>

            {/* Submit Button */}
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
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-2">rsID Format</h3>
            <p className="text-sm text-muted-foreground">
              Reference SNP identifiers like rs1333049, typically found in databases.
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-2">HGVS Format</h3>
            <p className="text-sm text-muted-foreground">
              Human Genome Variation Society notation like NM_007300.4:c.1687C&gt;T.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
