import { Github, Linkedin, User } from 'lucide-react';

const team = [
    { name: "Dr. Sarah Chen", role: "Lead Geneticist", bio: "PhD in Computational Biology. Expert in variant interpretation." },
    { name: "James Wilson", role: "AI Research Lead", bio: "Former DeepMind researcher specializing in transformer models." },
    { name: "Elena Rodriguez", role: "Full Stack Engineer", bio: "Specialist in secure medical data visualization and UI/UX." },
    { name: "David Kim", role: "Bioinformatics Analyst", bio: "Focuses on pipeline optimization and data preprocessing." }
];

export default function Team() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        A multidisciplinary team of geneticists, data scientists, and engineers working together to solve healthcare's biggest challenges.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, index) => (
                        <div key={index} className="group relative bg-slate-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="aspect-square bg-slate-200 flex items-center justify-center overflow-hidden">
                                <User className="w-24 h-24 text-slate-300" />
                            </div>
                            <div className="p-6 relative bg-white">
                                <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                                <div className="text-primary text-sm font-medium mb-3">{member.role}</div>
                                <p className="text-slate-500 text-sm mb-4 min-h-[60px]">{member.bio}</p>

                                <div className="flex gap-3">
                                    <a href="#" className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Github className="w-4 h-4 text-slate-600" /></a>
                                    <a href="#" className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Linkedin className="w-4 h-4 text-slate-600" /></a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
