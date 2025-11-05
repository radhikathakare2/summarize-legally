import { useState, useEffect } from "react";
import { ChevronLeft, Download, FileText, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import ClauseViewer from "@/components/ClauseViewer";
import RiskChart from "@/components/RiskChart";
import { useToast } from "@/hooks/use-toast";

// Demo data as fallback
const demoResults = {
  clauses: [
    {
      id: 1,
      title: "Data Collection and Usage",
      originalText: "We collect personal information including but not limited to your name, email address, phone number, browsing history, location data, and device information. This information may be shared with our partners, affiliates, and third-party service providers for marketing, advertising, and analytics purposes without requiring your explicit consent.",
      summaryEn: "Company collects extensive personal data and shares it with third parties for marketing without explicit consent.",
      summaryHi: "कंपनी व्यापक व्यक्तिगत डेटा एकत्र करती है और स्पष्ट सहमति के बिना मार्केटिंग के लिए तीसरे पक्ष के साथ साझा करती है।",
      risk: "high" as const,
      rationale: "Shares personal data with third parties without explicit consent. Broad data collection without clear purpose limitation.",
      category: "Privacy & Data",
    },
  ],
  statistics: {
    totalClauses: 1,
    highRisk: 1,
    mediumRisk: 0,
    lowRisk: 0,
  },
};

const Results = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState(demoResults);
  const [selectedClause, setSelectedClause] = useState(results.clauses[0]);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  useEffect(() => {
    // Load results from sessionStorage
    const storedResults = sessionStorage.getItem('analysisResults');
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        setResults(parsed);
        setSelectedClause(parsed.clauses[0]);
      } catch (e) {
        console.error('Failed to parse stored results:', e);
        toast({
          title: "Using demo data",
          description: "Could not load your analysis results",
        });
      }
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
              <p className="text-muted-foreground">
                Found {results.statistics.totalClauses} clauses requiring attention
              </p>
            </div>
            <PieChart className="w-12 h-12 text-primary" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {results.statistics.totalClauses}
              </div>
              <div className="text-sm text-muted-foreground">Total Clauses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-risk-high">
                {results.statistics.highRisk}
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-risk-medium">
                {results.statistics.mediumRisk}
              </div>
              <div className="text-sm text-muted-foreground">Medium Risk</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-risk-low">
                {results.statistics.lowRisk}
              </div>
              <div className="text-sm text-muted-foreground">Low Risk</div>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Clause List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-lg font-semibold mb-4">Document Clauses</h3>
            {results.clauses.map((clause) => (
              <Card
                key={clause.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedClause.id === clause.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedClause(clause)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm flex-1">{clause.title}</h4>
                  <Badge
                    variant="outline"
                    className={
                      clause.risk === 'high'
                        ? 'bg-risk-high/10 text-risk-high border-risk-high/30'
                        : clause.risk === 'medium'
                        ? 'bg-risk-medium/10 text-risk-medium border-risk-medium/30'
                        : 'bg-risk-low/10 text-risk-low border-risk-low/30'
                    }
                  >
                    {clause.risk}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{clause.category}</p>
              </Card>
            ))}
          </div>

          {/* Clause Viewer */}
          <div className="lg:col-span-2">
            <ClauseViewer clause={selectedClause} language={language} onLanguageChange={setLanguage} />
            
            {/* Risk Chart */}
            <Card className="p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
              <RiskChart data={results.statistics} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;