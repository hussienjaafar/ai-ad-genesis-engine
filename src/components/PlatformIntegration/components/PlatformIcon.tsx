
import { FacebookIcon, ChromeIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

interface PlatformIconProps {
  platform: string;
}

export const PlatformIcon = ({ platform }: PlatformIconProps) => {
  switch (platform) {
    case "facebook":
      return <FacebookIcon className="h-6 w-6" />;
    case "google":
      return <ChromeIcon className="h-6 w-6" />;
    case "linkedin":
      return <LinkedinIcon className="h-6 w-6" />;
    case "tiktok":
      return <TwitterIcon className="h-6 w-6" />; // Using Twitter as placeholder for TikTok
    default:
      return null;
  }
};
