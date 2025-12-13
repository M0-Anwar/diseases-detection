import Layout from '../components/layout/Layout';
import SystemExplanation from '../components/description/SystemExplanation';
import Workflow from '../components/description/Workflow';
import SupportedDiseases from '../components/description/SupportedDiseases';

export default function Description() {
    return (
        <Layout>
            <div className="pt-10">
                <div className="container mx-auto px-6 mb-8 text-center">
                    <h1 className="text-4xl font-bold text-slate-900">System Architecture & Workflow</h1>
                    <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Comprehensive overview of how our AI technology processes genetic data to deliver precise insights.</p>
                </div>
                <SystemExplanation />
                <Workflow />
                <SupportedDiseases />
            </div>
        </Layout>
    );
}
