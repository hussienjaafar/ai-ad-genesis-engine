
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { format, addDays } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useExperiments } from "@/hooks/useExperiments";
import { toast } from "sonner";

interface CreateExperimentModalProps {
  businessId: string;
  onClose: () => void;
}

interface Content {
  _id: string;
  title: string;
  type: string;
  platform: string;
}

const CreateExperimentModal = ({ businessId, onClose }: CreateExperimentModalProps) => {
  const [name, setName] = useState("");
  const [contentOriginal, setContentOriginal] = useState("");
  const [contentVariant, setContentVariant] = useState("");
  const [split, setSplit] = useState("50-50");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 14)); // Default to 14 days

  // Split options
  const splitOptions = [
    { value: "50-50", label: "50/50 (recommended)" },
    { value: "60-40", label: "60/40" },
    { value: "70-30", label: "70/30" },
    { value: "80-20", label: "80/20" },
    { value: "90-10", label: "90/10" },
  ];

  // Get split values
  const getSplitValues = () => {
    const [original, variant] = split.split("-").map(Number);
    return { original, variant };
  };

  // Fetch available content for the business
  const { data: contentItems, isLoading: contentLoading } = useQuery<Content[]>({
    queryKey: ['content', businessId],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}/content`);
      return response.data;
    }
  });

  const { createExperiment } = useExperiments(businessId);

  const handleSubmit = () => {
    if (!name || !contentOriginal || !contentVariant || !startDate || !endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (contentOriginal === contentVariant) {
      toast.error("Original and variant content must be different");
      return;
    }

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    createExperiment.mutate({
      name,
      contentIdOriginal: contentOriginal,
      contentIdVariant: contentVariant,
      split: getSplitValues(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const isNonRecommendedSplit = split !== "50-50";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create A/B Test Experiment</DialogTitle>
          <DialogDescription>
            Compare performance between original and variant content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Experiment Name</Label>
            <Input
              id="name"
              placeholder="e.g., Ad Copy Test - May 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contentOriginal">Original Content</Label>
            {contentLoading ? (
              <div className="h-10 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <Select
                value={contentOriginal}
                onValueChange={setContentOriginal}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select original content" />
                </SelectTrigger>
                <SelectContent>
                  {contentItems?.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.title} ({item.type} - {item.platform})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contentVariant">Variant Content</Label>
            {contentLoading ? (
              <div className="h-10 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <Select
                value={contentVariant}
                onValueChange={setContentVariant}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variant content" />
                </SelectTrigger>
                <SelectContent>
                  {contentItems?.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.title} ({item.type} - {item.platform})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="split">Traffic Split (Original/Variant)</Label>
            <Select value={split} onValueChange={setSplit}>
              <SelectTrigger>
                <SelectValue placeholder="Select split ratio" />
              </SelectTrigger>
              <SelectContent>
                {splitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isNonRecommendedSplit && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-700 text-sm">
                50/50 split is recommended for optimal statistical power. Uneven splits may require more traffic to detect changes.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) =>
                      date < startDate || date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createExperiment.isPending}>
            {createExperiment.isPending ? "Creating..." : "Create Experiment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExperimentModal;
