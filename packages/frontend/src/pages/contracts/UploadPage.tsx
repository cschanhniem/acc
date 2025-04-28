import { useState } from "react";
import { ContractFileType } from "@aicontractcheck/shared";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
}

export function UploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";
    const isValidType = ["pdf", "docx"].includes(file.name.split(".").pop()?.toLowerCase() ?? "");
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

    if (!isValidType) {
      setUploadState(prev => ({ ...prev, error: "Please upload a PDF or DOCX file" }));
      return;
    }

    if (!isValidSize) {
      setUploadState(prev => ({ ...prev, error: "File size must be less than 10MB" }));
      return;
    }

    // TODO: Implement file upload logic
    setUploadState({ isUploading: true, progress: 0 });
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1>Upload Contract</h1>
        
        <div className="card mt-6">
          <div className="text-center p-8">
            <div className="mb-6">
              <h2 className="text-h3 mb-2">Upload Your Contract</h2>
              <p className="text-slate">
                Upload your contract in PDF or DOCX format for instant analysis
              </p>
            </div>

            <div 
              className="border-2 border-dashed border-medium-gray rounded-lg p-8 hover:border-navy transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.files = e.dataTransfer.files;
                  handleFileChange({ target: input } as any);
                }
              }}
            >
              <div className="space-y-4">
                <div className="text-slate">
                  <p>Drag and drop your file here or</p>
                </div>
                
                <div>
                  <label className="btn-primary cursor-pointer">
                    Choose File
                    <input 
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      disabled={uploadState.isUploading}
                    />
                  </label>
                </div>

                <div className="text-small text-slate">
                  <p>Supported formats: PDF, DOCX</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </div>
            </div>

            {uploadState.error && (
              <div className="alert alert-error mt-4" role="alert">
                {uploadState.error}
              </div>
            )}

            {uploadState.isUploading && (
              <div className="mt-4">
                <div className="h-2 bg-light-gray rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-navy transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-small text-slate mt-2">
                  Uploading... {uploadState.progress}%
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="alert alert-info" role="alert">
            <p className="text-small">
              By uploading a contract, you agree to our{" "}
              <a href="/terms" className="underline hover:text-navy">
                Terms of Service
              </a>{" "}
              and acknowledge our{" "}
              <a href="/privacy" className="underline hover:text-navy">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
