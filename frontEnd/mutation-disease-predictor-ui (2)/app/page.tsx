import HomePageClient from "./HomePageClient"

export const metadata = {
  title: "Mutation → Disease Predictor | Genetic Disease Analysis",
  description:
    "Advanced genetic mutation analysis tool to predict disease associations with confidence scores and detailed scientific references.",
  keywords: ["genetics", "mutation analysis", "disease prediction", "bioinformatics"],
}

export default function HomePage() {
  return <HomePageClient />
}
