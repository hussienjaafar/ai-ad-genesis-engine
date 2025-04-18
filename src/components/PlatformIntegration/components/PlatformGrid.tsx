
import { AdPlatform } from "@/interfaces/types";
import { PlatformCard } from "./PlatformCard";
import { ConnectPlatformDialog } from "./ConnectPlatformDialog";

interface PlatformGridProps {
  platforms: AdPlatform[];
  onConnect: (platform: AdPlatform) => void;
  minimal?: boolean;
  isLoading?: boolean;
  currentOAuthPlatform: string | null;
  isDialogOpen: boolean;
  currentPlatform: AdPlatform | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDialog: () => void;
}

export const PlatformGrid = ({
  platforms,
  onConnect,
  minimal = false,
  isLoading = false,
  currentOAuthPlatform,
  isDialogOpen,
  currentPlatform,
  onOpenChange,
  onConfirmDialog
}: PlatformGridProps) => {
  const platformsToShow = minimal ? platforms.slice(0, 2) : platforms;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platformsToShow.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onConnect={onConnect}
            minimal={minimal}
            isLoading={isLoading && currentOAuthPlatform === platform.name}
          />
        ))}
      </div>
      <ConnectPlatformDialog
        platform={currentPlatform}
        isOpen={isDialogOpen}
        onOpenChange={onOpenChange}
        onConfirm={onConfirmDialog}
      />
    </>
  );
};
