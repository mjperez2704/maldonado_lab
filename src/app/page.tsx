import { TrendingUp, TrendingDown, LineChart, Briefcase } from 'lucide-react';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { CalendarView } from '@/components/dashboard/calendar-view';
import { MetricCard } from '@/components/dashboard/metric-card';

export default function Home() {
  // Hardcoded data for demonstration
  const revenue = 5420.50;
  const expenses = 2150.25;
  const profit = revenue - expenses;
  const appointments = 5; // Total appointments for the day, for AI insights.

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <main className="p-4 sm:p-6 lg:p-8 space-y-8">
        <header className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-lg shadow-md">
                <Briefcase className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold font-headline">
                BizView
            </h1>
        </header>

        <section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Today's Revenue"
              value={`$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={TrendingUp}
              description="+12.5% from yesterday"
            />
            <MetricCard
              title="Today's Expenses"
              value={`$${expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={TrendingDown}
              description="+8.2% from yesterday"
            />
            <MetricCard
              title="Today's Profit"
              value={`$${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={LineChart}
              description="Net profit after all costs"
              className="md:col-span-2 lg:col-span-1"
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-5 lg:gap-6">
            <div className="lg:col-span-2">
                <AIInsights
                    revenue={revenue}
                    expenses={expenses}
                    appointments={appointments}
                />
            </div>
            <div className="lg:col-span-3">
                <CalendarView />
            </div>
        </section>

      </main>
    </div>
  );
}
