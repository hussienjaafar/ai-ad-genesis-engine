
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFields } from "./FormFields";
import { useContentForm } from "./useContentForm";

interface ContentFormProps {
  businessId: string;
  offerings: string[];
  onContentGenerated: (content: any) => void;
}

export function ContentForm({ businessId, offerings, onContentGenerated }: ContentFormProps) {
  const { form, isSubmitting, isGenerating, onSubmit } = useContentForm(businessId, onContentGenerated);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormFields form={form} offerings={offerings} />
        <Button type="submit" disabled={isSubmitting || isGenerating}>
          {isSubmitting || isGenerating ? "Generating..." : "Generate Content"}
        </Button>
      </form>
    </Form>
  );
}

