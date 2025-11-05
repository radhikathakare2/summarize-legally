import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Clause {
  id: number;
  title: string;
  originalText: string;
  summaryEn: string;
  summaryHi: string;
  risk: "high" | "medium" | "low";
  rationale: string;
  category: string;
}

interface ClauseViewerProps {
  clause: Clause;
  language: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
}

const ClauseViewer = ({ clause, language, onLanguageChange }: ClauseViewerProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-risk-high/10 text-risk-high border-risk-high/30";
      case "medium":
        return "bg-risk-medium/10 text-risk-medium border-risk-medium/30";
      case "low":
        return "bg-risk-low/10 text-risk-low border-risk-low/30";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Risk Badge and Title */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">{clause.title}</h3>
          <p className="text-sm text-muted-foreground">{clause.category}</p>
        </div>
        <Badge
          variant="outline"
          className={`${getRiskColor(clause.risk)} px-4 py-2 text-sm font-semibold`}
        >
          {clause.risk.toUpperCase()} RISK
        </Badge>
      </div>

      {/* Language Toggle */}
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          <Button
            variant={language === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => onLanguageChange("en")}
          >
            English
          </Button>
          <Button
            variant={language === "hi" ? "default" : "outline"}
            size="sm"
            onClick={() => onLanguageChange("hi")}
          >
            हिंदी
          </Button>
        </div>
      </div>

      {/* Two-Pane View */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original Text */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            ORIGINAL CLAUSE
          </h4>
          <p className="text-sm leading-relaxed">{clause.originalText}</p>
        </Card>

        {/* Summary */}
        <Card className="p-6 bg-primary/5">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            PLAIN LANGUAGE SUMMARY
          </h4>
          <p className="text-sm leading-relaxed font-medium">
            {language === "en" ? clause.summaryEn : clause.summaryHi}
          </p>
        </Card>
      </div>

      {/* Risk Rationale */}
      <Card className={`p-6 ${getRiskColor(clause.risk)}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-2">Why this is flagged as {clause.risk} risk:</h4>
            <p className="text-sm leading-relaxed">{clause.rationale}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClauseViewer;