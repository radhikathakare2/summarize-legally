import { useState } from "react";
import { Upload, FileText, Shield, Languages, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import TextPaste from "@/components/TextPaste";

const Index = () => {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Termify</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Understand Legal Documents
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              In Plain English
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload any EULA, Terms of Service, or legal document, or simply paste the text directly to get an AI-powered summary with risk analysis, clause-by-clause breakdowns, and multilingual support.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Risk Detection</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Languages className="w-4 h-4" />
              <span className="text-sm font-medium">Plain English + Hindi</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Visual Summaries</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-3xl mx-auto mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-2">
                <FileText className="w-4 h-4" />
                Paste Text
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-6">
              <FileUpload />
            </TabsContent>
            <TabsContent value="paste" className="mt-6">
              <TextPaste />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-16 bg-secondary/50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How Termify Works
          </h3>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Our AI analyzes your documents and breaks them down into understandable insights
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">Upload or Paste</h4>
              <p className="text-muted-foreground">
                Drop your file, browse to upload, or paste text directly. We support OCR for scanned documents.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">AI Analysis</h4>
              <p className="text-muted-foreground">
                Our AI breaks down clauses, identifies risks, and creates summaries in multiple languages.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">Get Results</h4>
              <p className="text-muted-foreground">
                View risk-coded summaries, download reports, and export clause mappings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Examples Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Automated Risk Detection
          </h3>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Instantly identify problematic clauses with our traffic-light system
          </p>
          
          <div className="space-y-6">
            <div className="border border-risk-high/30 rounded-lg p-6 bg-risk-high/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-risk-high text-risk-high-foreground text-sm font-medium">
                  High Risk
                </span>
                <span className="font-semibold">Data Sharing</span>
              </div>
              <p className="text-muted-foreground italic">
                "We may share your personal information with third parties for marketing purposes without explicit consent."
              </p>
            </div>
            
            <div className="border border-risk-medium/30 rounded-lg p-6 bg-risk-medium/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-risk-medium text-risk-medium-foreground text-sm font-medium">
                  Medium Risk
                </span>
                <span className="font-semibold">Auto-Renewal</span>
              </div>
              <p className="text-muted-foreground italic">
                "Your subscription will automatically renew unless cancelled 30 days in advance."
              </p>
            </div>
            
            <div className="border border-risk-low/30 rounded-lg p-6 bg-risk-low/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-risk-low text-risk-low-foreground text-sm font-medium">
                  Low Risk
                </span>
                <span className="font-semibold">Standard Terms</span>
              </div>
              <p className="text-muted-foreground italic">
                "You may terminate this agreement at any time by contacting customer support."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Termify. Making legal documents understandable for everyone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;