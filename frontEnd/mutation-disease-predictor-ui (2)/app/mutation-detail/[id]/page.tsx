"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, Dna } from "lucide-react"

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

const mockMutationData: { [key: string]: MutationDetail } = {
  "disease-1": {
    id: "disease-1",
    diseaseName: "Coronary Artery Disease",
    mutations: [
      {
        name: "rs1333049",
        rsId: "rs1333049",
        gene: "CDKN2A/B",
        chromosome: "chr9",
        position: "22125501",
        pathogenicity: "High",
        alleleFreq: "0.48",
        description:
          "Located in the 9p21 locus, this variant is strongly associated with increased coronary artery disease risk across multiple populations.",
      },
      {
        name: "rs1342326",
        rsId: "rs1342326",
        gene: "PHACTR1",
        chromosome: "chr6",
        position: "12906369",
        pathogenicity: "High",
        alleleFreq: "0.32",
        description:
          "Associated with vascular biology and endothelial function, contributing to cardiovascular disease susceptibility.",
      },
    ],
    clinicalSignificance:
      "These variants collectively increase the risk of early-onset coronary artery disease by approximately 1.5-2.0 fold in carriers.",
    inheritance: "Autosomal dominant with incomplete penetrance",
    references: [
      {
        title: "Genome-wide association study of coronary artery disease",
        pmid: "17554300",
        url: "#",
      },
      {
        title: "The 9p21 region and cardiovascular risk",
        pmid: "18469339",
        url: "#",
      },
    ],
    externalLinks: [
      { name: "NCBI Gene - CDKN2A", url: "https://www.ncbi.nlm.nih.gov/gene/1029" },
      { name: "ClinVar - rs1333049", url: "https://www.ncbi.nlm.nih.gov/clinvar/" },
      { name: "dbSNP - rs1333049", url: "https://www.ncbi.nlm.nih.gov/snp/" },
    ],
  },
}

export default function MutationDetailPage({ params }: { params: { id: string } }) {
  const data = mockMutationData[params.id] || mockMutationData["disease-1"]

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Dna className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mutation Details</h1>
              <p className="text-sm text-muted-foreground">{data.diseaseName}</p>
            </div>
          </div>
          <Link
            href="/results"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">{data.diseaseName}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Clinical Significance</p>
              <p className="text-foreground">{data.clinicalSignificance}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Inheritance Pattern</p>
              <p className="text-foreground">{data.inheritance}</p>
            </div>
          </div>
        </div>

        {/* Mutations Table */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Associated Mutations</h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Mutation ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Gene</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Location</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Pathogenicity</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Allele Freq</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mutations.map((mut, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">{mut.rsId}</td>
                      <td className="px-6 py-4 text-foreground">{mut.gene}</td>
                      <td className="px-6 py-4 text-foreground">
                        {mut.chromosome}:{mut.position}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                          {mut.pathogenicity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">{mut.alleleFreq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mutation Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {data.mutations.map((mut, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6">
              <h4 className="text-lg font-semibold text-foreground mb-3">{mut.name}</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium">Gene</p>
                  <p className="text-foreground">{mut.gene}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Location</p>
                  <p className="text-foreground">
                    {mut.chromosome}:{mut.position}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Description</p>
                  <p className="text-foreground">{mut.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* References */}
        <div className="bg-card rounded-xl border border-border p-8 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Scientific References</h3>
          <div className="space-y-4">
            {data.references.map((ref, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0">
                <span className="text-primary font-semibold mt-1">•</span>
                <div>
                  <p className="text-foreground font-medium mb-1">{ref.title}</p>
                  <p className="text-sm text-muted-foreground">PMID: {ref.pmid}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* External Links */}
        <div className="bg-card rounded-xl border border-border p-8">
          <h3 className="text-lg font-bold text-foreground mb-4">External Resources</h3>
          <div className="space-y-3">
            {data.externalLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors group"
              >
                <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                  {link.name}
                </span>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
