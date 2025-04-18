
# Meta App Review Demo Script

This script provides step-by-step instructions for Meta reviewers to test our application's functionality and assess compliance with Meta's platform policies.

## Demo Prerequisites

- Test user credentials have been provided in the app review submission
- Test ad accounts are already set up with sample campaigns
- The application is deployed to our production environment

## Step 1: Accessing the Application

1. Navigate to https://app.[YOUR_DOMAIN].com
2. Click "Sign In" in the top-right corner
3. Enter the demo credentials:
   - Email: [DEMO_EMAIL]
   - Password: [DEMO_PASSWORD]
4. You will be taken to the dashboard overview

## Step 2: Connecting Meta/Facebook Ads

1. From the dashboard, click "Platform Integration" in the left sidebar
2. On the Platform Integration page, locate the "Meta (Facebook)" card
3. Click the "Connect" button on the Meta card
4. A popup window will appear with the Meta OAuth authorization flow
5. Sign in with the Meta demo account credentials provided in the submission
6. When prompted to select an ad account, choose the test ad account "[TEST_AD_ACCOUNT_NAME]"
7. Review and approve the requested permissions (ads_management, ads_read)
8. After approving, you will be redirected back to our application

## Step 3: Viewing Ad Performance Data

1. You should now see that Meta is connected, with a green "Connected" status
2. Click on "Dashboard" in the left sidebar
3. The dashboard will display key metrics from the connected Meta ad account
4. You can view aggregate performance metrics like:
   - Total ad spend
   - Average CTR (Click-Through Rate)
   - CPC (Cost Per Click)
   - Conversion rate

## Step 4: Exploring Ad Analytics

1. Click "Analytics" in the left sidebar
2. The analytics page shows more detailed performance data from Meta
3. You can view charts displaying:
   - Daily ad spend
   - Engagement metrics over time
   - Campaign performance comparison
4. All data is read-only and securely fetched from the Meta Ads API

## Step 5: AI-Generated Ad Recommendations

1. Click "Ad Generator" in the left sidebar
2. The system will analyze performance data from Meta
3. The page will display AI-generated recommendations for improving ad performance
4. Note that our application only reads data from Meta and does not create or modify ads directly

## Step 6: Data Management & Transparency

1. Click on your profile icon in the top-right corner
2. Select "Account Settings"
3. Navigate to the "Connected Platforms" tab
4. You can see all connected platforms, including Meta
5. The "Disconnect" button allows users to revoke access at any time
6. Links to our Privacy Policy and Data Deletion page are clearly visible

## Step 7: Testing Error Handling (Optional)

1. Click the "Disconnect" button for Meta
2. Then try to click "Connect" again but close the popup window
3. Notice how our application handles this gracefully with a clear error message
4. The error provides guidance on how to resolve the issue

## Conclusion

This completes the demonstration of our application's Meta integration. The integration:

- Requests only necessary permissions for analyzing ad performance
- Handles authorization flows securely
- Provides valuable insights based on ad data
- Gives users full control over their connected accounts
- Handles errors gracefully with clear guidance

No data is modified on Meta platforms, and users can revoke access at any time.
