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

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
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
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      // Handle text files directly
      if (fileType === 'text/plain') {
        const text = await file.text();
        
        console.log('Analyzing text document...');
        const { data, error } = await supabase.functions.invoke('analyze-document', {
          body: { text }
        });

        if (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis failed",
            description: error.message || "Failed to analyze document",
            variant: "destructive",
          });
          return;
        }

        console.log('Analysis complete:', data);
        sessionStorage.setItem('analysisResults', JSON.stringify(data));
        navigate('/results');
        
        toast({
          title: "Success",
          description: "Document analyzed successfully",
        });
        return;
      }

      // Handle PDF, DOCX files - upload to storage first
      if (
        fileType === 'application/pdf' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileExtension === 'pdf' ||
        fileExtension === 'docx'
      ) {
        console.log('Uploading document to storage...');
        
        // Create a unique file path
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const filePath = `temp/${fileName}`;

        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload failed",
            description: uploadError.message || "Failed to upload document",
            variant: "destructive",
          });
          return;
        }

        console.log('Document uploaded, analyzing...');

        // Call edge function with file path
        const { data, error } = await supabase.functions.invoke('analyze-document', {
          body: { filePath }
        });

        if (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis failed",
            description: error.message || "Failed to analyze document",
            variant: "destructive",
          });
          return;
        }

        console.log('Analysis complete:', data);
        sessionStorage.setItem('analysisResults', JSON.stringify(data));
        navigate('/results');
        
        toast({
          title: "Success",
          description: "Document analyzed successfully",
        });
        return;
      }

      // Unsupported file type
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, DOCX, or TXT file",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [navigate, toast]);

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
