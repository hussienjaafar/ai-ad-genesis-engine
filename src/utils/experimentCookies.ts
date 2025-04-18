
/**
 * Get the assigned variant for an experiment from cookies
 * 
 * @param experimentId The experiment ID
 * @returns 'original' | 'variant' | null if not found
 */
export const getExperimentVariant = (experimentId: string): 'original' | 'variant' | null => {
  try {
    const cookieName = `exp_${experimentId}`;
    const cookies = document.cookie.split('; ');
    
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === cookieName) {
        return value === 'original' || value === 'variant' 
          ? value as 'original' | 'variant'
          : null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error reading experiment cookie:', error);
    return null;
  }
};

/**
 * Set a cookie for an experiment variant
 * 
 * @param experimentId The experiment ID
 * @param variant 'original' or 'variant'
 * @param expiryDays Days until the cookie expires
 */
export const setExperimentVariant = (
  experimentId: string, 
  variant: 'original' | 'variant',
  expiryDays = 30
): void => {
  try {
    const cookieName = `exp_${experimentId}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    document.cookie = `${cookieName}=${variant}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Error setting experiment cookie:', error);
  }
};

/**
 * Generate a consistent visitor ID or retrieve existing one
 * Uses either a custom cookie or generates a new one
 */
export const getOrCreateVisitorId = (): string => {
  const cookieName = 'fp_cookie';
  
  try {
    // First check if the visitor ID cookie exists
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === cookieName) {
        return value;
      }
    }
    
    // If not found, generate a new ID
    const newVisitorId = 'visitor_' + Math.random().toString(36).substring(2, 15);
    
    // Set as cookie with 1 year expiry
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    document.cookie = `${cookieName}=${newVisitorId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    return newVisitorId;
  } catch (error) {
    console.error('Error with visitor ID cookie:', error);
    return 'anonymous';
  }
};
