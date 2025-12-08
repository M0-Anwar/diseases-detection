"use client"

import { Link } from "react-router-dom"
import { ArrowRight, Dna, Database, Zap, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-card/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Dna className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mutation → Disease Predictor</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/input" className="text-foreground hover:text-primary transition-colors font-medium">
              Analyze
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-2xl text-center space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              Predict Disease Risk from Genetic Mutations
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground text-balance">
              Enter your genetic mutations and receive comprehensive disease predictions with confidence scores and
              detailed analysis.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/input"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-opacity-90 text-primary-foreground rounded-lg font-semibold transition-all hover:shadow-lg transform hover:scale-105"
            >
              Start Analysis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-card border-t border-border py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-foreground mb-12 text-center">How It Works</h3>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Dna className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Enter Mutations</h4>
              <p className="text-muted-foreground">
                Input your genetic mutations in rsID or HGVS format, one per line.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">AI Analysis</h4>
              <p className="text-muted-foreground">
                Advanced models analyze mutations and predict associated diseases.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-accent" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Get Results</h4>
              <p className="text-muted-foreground">
                View predictions with confidence scores and download comprehensive reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-8 flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Research & Educational Use Only</h3>
              <p className="text-muted-foreground">
                This tool is designed for research and educational purposes. Results should not be used for clinical
                diagnosis. Please consult healthcare professionals for medical advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3">About</h4>
              <p className="text-sm text-muted-foreground">Advanced genetic mutation analysis for research purposes.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Mutation Disease Predictor. For research and educational purposes.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
