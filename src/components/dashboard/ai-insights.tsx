"use client";

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { generateBusinessInsights, type GenerateBusinessInsightsOutput } from '@/ai/flows/generate-business-insights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AIInsightsProps {
    revenue: number;
    expenses: number;
    appointments: number;
}

export function AIInsights({ revenue, expenses, appointments }: AIInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateBusinessInsightsOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const insights = await generateBusinessInsights({
        revenue,
        expenses,
        appointments,
        keyMetrics: "Increase daily profit and customer engagement.",
      });
      setResult(insights);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error Generating Insights",
        description: "Failed to generate AI insights. Please try again later.",
      })
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">AI Daily Briefing</CardTitle>
            <CardDescription>Your AI-powered business advisor.</CardDescription>
          </div>
           <Wand2 className="h-7 w-7 text-accent" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-6 w-1/2 mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : result ? (
          <div className="space-y-6 text-sm">
            <div>
              <h4 className="font-semibold text-md mb-2 text-foreground">Key Insights</h4>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.insights}</p>
            </div>
            <div>
              <h4 className="font-semibold text-md mb-2 text-foreground">Suggestions</h4>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.suggestions}</p>
            </div>
            <Button onClick={handleGenerate} variant="outline" size="sm" className="mt-4">
              <Wand2 className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center h-full pt-4">
            <p className="text-muted-foreground mb-4 max-w-xs">Get AI-powered insights and suggestions based on your daily performance.</p>
            <Button onClick={handleGenerate}>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Briefing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
