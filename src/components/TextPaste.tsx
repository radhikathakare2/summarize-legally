import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TextPaste = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (text.trim().length < 100) {
      toast({
        title: "Text too short",
        description: "Please paste at least 100 characters of legal text",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { text: text.trim() }
      });

      if (error) throw error;

      // Store results in sessionStorage for the results page
      sessionStorage.setItem('analysisResults', JSON.stringify(data));
      
      toast({
        title: "Analysis complete!",
        description: `Found ${data.statistics.totalClauses} clauses`,
      });

      navigate("/results");
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste your EULA, Terms of Service, or any legal document text here..."
        className="min-h-[300px] resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isAnalyzing}
      />
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {text.length} characters
        </p>
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || text.trim().length < 100}
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Document"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TextPaste;