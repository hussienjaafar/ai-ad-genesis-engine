
# Troubleshooting Meta (Facebook) Connections

This guide helps troubleshoot common issues when connecting your Meta/Facebook advertising account.

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

## Troubleshooting Steps

### 1. Check your browser settings

Meta's OAuth process uses popups, which may be blocked by your browser:

**Chrome**
1. Look for the popup blocked icon in the address bar
2. Click it and select "Always allow popups from this site"
3. Click "Done" and try connecting again

**Firefox**
1. Look for the popup blocked icon in the address bar
2. Click "Options" > "Allow popups for [site]"
3. Try connecting again

**Safari**
1. Go to Safari > Preferences > Websites > Pop-up Windows
2. Find our site and select "Allow"
3. Try connecting again

### 2. Verify your Facebook permissions

To connect your ad account, you need either:
- Admin access to the ad account
- Advertiser access + explicit permission to share the account with applications

To check your access level:
1. Go to [Facebook Business Manager](https://business.facebook.com/settings/)
2. Click "Ad Accounts" in the left menu
3. Select the ad account you want to connect
4. Click "Users" tab
5. Find your name and check your permission level

### 3. Clear browser cache and cookies

Sometimes cached authentication data can interfere with the connection process:

1. Clear your browser cache and cookies (or just for our domain)
2. Close and reopen your browser
3. Try connecting again

### 4. Try a different browser

If you continue experiencing issues:
1. Try using a different browser (Chrome, Firefox, Edge, Safari)
2. Ensure you're not using incognito/private browsing mode
3. Temporarily disable browser extensions that might interfere with popups

## Still Having Problems?

Contact our support team at:

- Email: support@[YOUR-DOMAIN].com
- Live chat: Available Mon-Fri, 9am-5pm ET

Please include:
- Screenshot of any error messages
- Browser and device you're using
- Your account email address
- Time when the error occurred

![Meta Error Example](../public/images/meta-error-example.png)
