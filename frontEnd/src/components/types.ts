export type Disease = {
    id: string;
    name: string;
    confidence: number;
    mutations: string[];
    pathogenicity: "High" | "Medium" | "Low";
    description: string;
    references: string[];
}