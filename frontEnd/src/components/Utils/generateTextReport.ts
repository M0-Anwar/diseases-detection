import { Disease } from '../types';

export const generateTextReport = (diseaseData: Disease) => {
    const reportContent = `
========================================
         GENOMIC ANALYSIS REPORT
========================================

Report ID: ${diseaseData.id.toUpperCase()}
Generated: ${new Date().toLocaleString()}

PATIENT INFORMATION
-------------------
Condition: ${diseaseData.name}
Risk Level: ${diseaseData.pathogenicity}
Confidence Score: ${diseaseData.confidence.toFixed(1)}%

GENETIC FINDINGS
----------------
${diseaseData.mutations.length > 0 
    ? diseaseData.mutations.map((m, i) => `${i + 1}. ${m}`).join('\n')
    : 'No specific mutations identified'}

CLINICAL INTERPRETATION
-----------------------
${diseaseData.description}

RECOMMENDATIONS
---------------
1. Schedule genetic counseling session
2. Confirmatory Sanger sequencing
3. Family screening evaluation
4. Regular clinical monitoring

REFERENCES
----------
${diseaseData.references.length > 0 
    ? diseaseData.references.map((r, i) => `[${i + 1}] ${r}`).join('\n')
    : 'No references available'}

========================================
          END OF REPORT
========================================
Confidential - For Clinical Use Only
`;

    // Create and download text file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${diseaseData.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};