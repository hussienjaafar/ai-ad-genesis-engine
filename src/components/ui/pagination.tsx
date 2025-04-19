
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const maxVisiblePages = 5;
  
  // Calculate the range of page numbers to display
  const getVisiblePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let start = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let end = start + maxVisiblePages - 1;
    
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(totalPages - maxVisiblePages + 1, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  const visiblePages = getVisiblePageNumbers();
  
  return (
    <nav className="flex justify-center">
      <ul className="flex items-center gap-1">
        <li>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
        </li>
        
        {visiblePages[0] > 1 && (
          <>
            <li>
              <Button
                variant={currentPage === 1 ? "secondary" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(1)}
              >
                1
              </Button>
            </li>
            {visiblePages[0] > 2 && (
              <li>
                <span className="px-2">...</span>
              </li>
            )}
          </>
        )}
        
        {visiblePages.map((page) => (
          <li key={page}>
            <Button
              variant={currentPage === page ? "secondary" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          </li>
        ))}
        
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <li>
                <span className="px-2">...</span>
              </li>
            )}
            <li>
              <Button
                variant={currentPage === totalPages ? "secondary" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </li>
          </>
        )}
        
        <li>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </li>
      </ul>
    </nav>
  );
}
