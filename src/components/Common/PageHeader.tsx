
import { Button } from "@/components/ui/button";
import { HelpCircleIcon, BellIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex items-center space-x-2">
        {actions}
        <Button variant="outline" size="icon">
          <BellIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircleIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
