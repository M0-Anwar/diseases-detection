import Layout from '../components/layout/Layout';
import Mission from '../components/about/Mission';
import TechStack from '../components/about/TechStack';
import Team from '../components/about/Team';

export default function About() {
    return (
        <Layout>
            <div className="pt-10">
                <div className="container mx-auto px-6 mb-8 text-center">
                    <h1 className="text-4xl font-bold text-slate-900">About Us</h1>
                    <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Pioneering the intersection of artificial intelligence and genomic medicine.</p>
                </div>
                <Mission />
                <TechStack />
                <Team />
            </div>
        </Layout>
    );
}
