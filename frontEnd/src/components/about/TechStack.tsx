export default function TechStack() {
  const stack = [
    { name: "React 18", category: "Frontend", color: "bg-blue-500" },
    { name: "TypeScript", category: "Language", color: "bg-blue-600" },
    { name: "Vite", category: "Build Tool", color: "bg-purple-500" },
    { name: "Tailwind CSS", category: "Styling", color: "bg-cyan-500" },
    { name: "Framer Motion", category: "Animation", color: "bg-pink-500" },
    { name: "TensorFlow", category: "AI Model", color: "bg-orange-500" },
    { name: "Python", category: "Backend", color: "bg-yellow-500" },
    { name: "FastAPI", category: "API", color: "bg-teal-500" }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Built With Advanced Technology</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stack.map((tech, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-3 h-3 rounded-full ${tech.color}`} />
              <div>
                <div className="font-bold text-slate-900 text-lg">{tech.name}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">{tech.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
