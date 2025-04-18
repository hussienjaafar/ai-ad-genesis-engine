
import { useState, useEffect } from "react";
import { AdPlatform } from "@/interfaces/types";
import { mockAdPlatforms } from "@/lib/mockData";

export const usePlatformStatus = (businessId: string) => {
  const [platforms, setPlatforms] = useState(mockAdPlatforms);

  // Fetch platform status from API (in real app)
  useEffect(() => {
    const fetchPlatformStatus = async () => {
      try {
        // Mock data for demonstration
        const platformsWithStatus = platforms.map(platform => {
          if (platform.name === 'facebook') {
            return {
              ...platform,
              needsReauth: Math.random() > 0.5 // Random for demo purposes
            };
          }
          return platform;
        });
        
        setPlatforms(platformsWithStatus);
      } catch (error) {
        console.error('Error fetching platform status:', error);
      }
    };
    
    if (businessId) {
      fetchPlatformStatus();
    }
  }, [businessId]);

  return {
    platforms,
    setPlatforms
  };
};
