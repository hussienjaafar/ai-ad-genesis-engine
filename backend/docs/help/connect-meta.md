
# Troubleshooting Meta (Facebook) Connections

This guide helps troubleshoot common issues when connecting your Meta advertising account.

## Common Error Messages

### "Authorization cancelled"

**Possible causes:**
- You closed the popup window before completing the authorization
- You denied permission requests
- Your browser is blocking popups

**Solution:**
1. Ensure popups are allowed for our application
2. Click "Retry" on the error message
3. Complete the entire authorization flow without closing the window

### "invalid_scope"

**Possible causes:**
- The requested permissions are not enabled for the Facebook App
- Your Facebook account doesn't have sufficient permissions on the ad account

**Solution:**
1. Ensure you're an admin of the Facebook Ad Account
2. If you're using Business Manager, verify you have "Manage campaigns" permission
3. Contact support if the issue persists

### "User is not authorized for this action"

**Possible causes:**
- The selected ad account is not accessible to your Facebook user
- Your role in Business Manager doesn't have sufficient permissions

**Solution:**
1. Check your access level in Facebook Business Settings
2. Ask an admin to grant you "Advertiser" or "Admin" access to the ad account
3. Try reconnecting after permissions are updated

### "This app is still in development mode"

**Possible causes:**
- You're trying to connect with a Facebook account that is not a developer/tester on the app

**Solution:**
Contact our support team at support@[YOUR-DOMAIN].com - we'll either:
1. Add your account as a developer/tester (for testing purposes)
2. Let you know when the app is approved for public use

## Checking Ad Account Permissions

To verify your permissions on a Facebook Ad Account:

1. Go to [Facebook Business Manager](https://business.facebook.com/settings/)
2. Click "Ad Accounts" in the left menu
3. Select the ad account you want to connect
4. Click "Users" tab
5. Find your name and check your permission level (need "Advertiser" or higher)

## Rate Limiting Issues

If you see "API rate limit exceeded" errors:

1. Wait 5-10 minutes before trying again
2. Make sure no other integrations are making heavy API calls to the same ad account
3. If persistent, contact our support for assistance optimizing your setup

## Browser-Specific Issues

### Chrome

- Check if third-party cookies are blocked
- Disable extensions that might interfere with authentication popups

### Safari

- Ensure "Prevent Cross-Site Tracking" is disabled for our site
- Allow popups for our domain

### Firefox

- Check your Enhanced Tracking Protection settings
- Allow popups for our domain

## Still Having Problems?

Contact our support team at:

- Email: support@[YOUR-DOMAIN].com
- Live chat: Available Mon-Fri, 9am-5pm ET
- Phone: [YOUR-SUPPORT-PHONE]

Please include:
- Screenshot of any error messages
- Browser and device you're using
- Your account email address
- Time when the error occurred
