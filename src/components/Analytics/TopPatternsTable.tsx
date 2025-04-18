
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import { PatternInsight } from "@/interfaces/analytics";
import { Button } from "@/components/ui/button";
import { GenerateFromInsightModal } from "./GenerateFromInsightModal";

interface TopPatternsTableProps {
  insights: PatternInsight[];
}

type SortField = "element" | "elementType" | "uplift" | "confidence";
type SortDirection = "asc" | "desc";

const TopPatternsTable = ({ insights }: TopPatternsTableProps) => {
  const [sortField, setSortField] = useState<SortField>("uplift");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedInsight, setSelectedInsight] = useState<PatternInsight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleGenerateVariation = (insight: PatternInsight) => {
    setSelectedInsight(insight);
    setIsModalOpen(true);
  };

  const getSortedInsights = () => {
    return [...insights].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortField) {
        case "element":
          valueA = a.element;
          valueB = b.element;
          break;
        case "elementType":
          valueA = a.elementType;
          valueB = b.elementType;
          break;
        case "uplift":
          valueA = a.performance.uplift;
          valueB = b.performance.uplift;
          break;
        case "confidence":
          valueA = a.performance.confidence;
          valueB = b.performance.confidence;
          break;
        default:
          valueA = a.performance.uplift;
          valueB = b.performance.uplift;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc" 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      return sortDirection === "asc" 
        ? (valueA as number) - (valueB as number) 
        : (valueB as number) - (valueA as number);
    });
  };

  const sortedInsights = getSortedInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Patterns</CardTitle>
        <CardDescription>
          Performance patterns discovered in your ad content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("element")}
                  className="flex items-center"
                >
                  Element
                  {sortField === "element" && (
                    sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("elementType")}
                  className="flex items-center"
                >
                  Type
                  {sortField === "elementType" && (
                    sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("uplift")}
                  className="flex items-center"
                >
                  Uplift
                  {sortField === "uplift" && (
                    sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("confidence")}
                  className="flex items-center"
                >
                  Confidence
                  {sortField === "confidence" && (
                    sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Sample Size</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInsights.length > 0 ? (
              sortedInsights.map((insight, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{insight.element}</TableCell>
                  <TableCell className="capitalize">{insight.elementType}</TableCell>
                  <TableCell className="text-green-600">+{(insight.performance.uplift * 100).toFixed(2)}%</TableCell>
                  <TableCell>{(insight.performance.confidence * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    {insight.performance.withElement.sampleSize + insight.performance.withoutElement.sampleSize}
                  </TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => handleGenerateVariation(insight)}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Variation
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No pattern insights available yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      {selectedInsight && (
        <GenerateFromInsightModal
          insight={selectedInsight}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Card>
  );
};

export default TopPatternsTable;
