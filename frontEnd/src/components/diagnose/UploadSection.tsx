import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '../../lib/utils';

interface UploadSectionProps {
    onUpload: (file: File) => void;
}

export default function UploadSection({ onUpload }: UploadSectionProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File) => {
        // Simple validation for demo
        if (!file.name.match(/\.(csv|json|txt)$/i)) {
            setError("Invalid file format. Please upload CSV or JSON.");
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File size too large. Max 5MB.");
            return false;
        }
        setError(null);
        return true;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                onUpload(file);
            }
        }
    }, [onUpload]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                onUpload(file);
            }
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
                    error ? "border-red-300 bg-red-50" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileInput}
                    accept=".csv,.json,.txt"
                />

                <div className="flex flex-col items-center pointer-events-none">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300",
                        error ? "bg-red-100 text-red-600" : "bg-blue-50 text-primary"
                    )}>
                        {error ? <AlertCircle className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {error ? "Upload Failed" : "Upload Genetic Data"}
                    </h3>

                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        {error ? error : "Drag and drop your sequencing file here, or click to browse. Supports CSV and JSON formats."}
                    </p>

                    {!error && (
                        <div className="flex gap-4 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> CSV</span>
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> JSON</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
