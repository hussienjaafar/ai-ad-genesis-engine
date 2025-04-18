
export const getPlatformName = (platformCode: string) => {
  switch (platformCode) {
    case "facebook":
      return "Facebook Ads";
    case "google":
      return "Google Ads";
    case "linkedin":
      return "LinkedIn Ads";
    case "tiktok":
      return "TikTok Ads";
    default:
      return platformCode;
  }
};

export const getPlatformDescription = (platformCode: string) => {
  switch (platformCode) {
    case "facebook":
      return "Connect to Facebook Ads to analyze campaigns and generate optimized ad content.";
    case "google":
      return "Connect to Google Ads to analyze search campaigns and generate optimized ad content.";
    case "linkedin":
      return "Connect to LinkedIn Ads for B2B campaign analysis and ad generation.";
    case "tiktok":
      return "Connect to TikTok Ads for video ad performance analysis and content generation.";
    default:
      return "";
  }
};
