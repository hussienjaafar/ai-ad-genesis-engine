
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ExperimentResult } from "@/interfaces/experiment";

interface ExperimentPerformanceChartProps {
  results: ExperimentResult;
}

const ExperimentPerformanceChart = ({ results }: ExperimentPerformanceChartProps) => {
  const { original, variant } = results.results;
  
  // Prepare data for the chart
  const chartData = [
    {
      name: "Conversion Rate",
      Original: parseFloat((original.conversionRate * 100).toFixed(2)),
      Variant: parseFloat((variant.conversionRate * 100).toFixed(2)),
    },
    {
      name: "Click Rate",
      Original: parseFloat((original.clicks / original.impressions * 100).toFixed(2)),
      Variant: parseFloat((variant.clicks / variant.impressions * 100).toFixed(2)),
    }
  ];

  // Custom tooltip formatter
  const tooltipFormatter = (value: number) => [`${value.toFixed(2)}%`, "Rate"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
        <CardDescription>
          Comparing key metrics between original and variant content
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              tickFormatter={(tick) => `${tick}%`}
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Bar dataKey="Original" fill="#8884d8" />
            <Bar dataKey="Variant" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ExperimentPerformanceChart;
