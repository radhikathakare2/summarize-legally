import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const FileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // For text files, read directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        
        const { data, error } = await supabase.functions.invoke('analyze-document', {
          body: { text }
        });

        if (error) throw error;

        // Store results in sessionStorage for the results page
        sessionStorage.setItem('analysisResults', JSON.stringify(data));
        
        toast({
          title: "Analysis complete!",
          description: `Found ${data.statistics.totalClauses} clauses`,
        });

        navigate("/results");
      } else {
        // For PDFs and other formats, show message
        toast({
          title: "PDF support coming soon",
          description: "Please paste the text directly for now",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium">Uploading and analyzing...</p>
          </>
        ) : isDragActive ? (
          <>
            <Upload className="w-12 h-12 text-primary" />
            <p className="text-lg font-medium">Drop your document here</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <File className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop your document here</p>
              <p className="text-sm text-muted-foreground">
                or <button className="text-primary hover:underline">browse files</button>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports: PDF, DOCX, TXT, PNG, JPG
              <br />
              Maximum file size: 50MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;