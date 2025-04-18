
# Meta App Review Checklist

This document outlines all required fields and settings for the Meta Business App to pass app review.

## Basic App Settings

- [ ] **App ID**: [YOUR_APP_ID]
- [ ] **App Display Name**: [YOUR_APP_NAME]
- [ ] **App Icon**: 1024x1024px PNG, under 1MB
- [ ] **Contact Email**: support@[YOUR_DOMAIN].com
- [ ] **Privacy Policy URL**: https://[YOUR_DOMAIN].com/legal/privacy
- [ ] **Terms of Service URL**: https://[YOUR_DOMAIN].com/legal/terms
- [ ] **App Category**: Marketing & Advertising
- [ ] **Business Use**: Marketing & Advertising
- [ ] **Detailed Description**: "This application helps businesses optimize their advertising campaigns by analyzing performance data and generating AI-powered recommendations."

## Permissions & Features

- [ ] **Required Permissions**:
  - ads_management
  - ads_read
  - business_management (if managing business assets)
  - public_profile

- [ ] **Optional Permissions**:
  - email
  - pages_show_list (if managing page content)

## Data Deletion Requirement

- [ ] **Data Deletion Callback URL**: https://[YOUR_DOMAIN].com/legal/data-deletion
- [ ] **Data Deletion Instructions**: Provided in the privacy policy

## User Experience

- [ ] **Login Flow**: Standard OAuth flow with clear permission screens
- [ ] **Permissions Usage Explanation**:
  - ads_management: "To analyze ad performance and create optimized campaigns"
  - ads_read: "To gather insights about your existing campaigns"
  - business_management: "To properly associate ads with your business accounts"

## App Review Submission

- [ ] **Demo User Credentials**:
  - Email: [DEMO_EMAIL]
  - Password: [DEMO_PASSWORD]
  - Role: Admin access to test ad accounts
  - Instructions: See meta-review-demo.md

- [ ] **Demo Video**: 2-3 minute screencast showing the complete user journey
  - Initial login
  - Authorization flow
  - Data displayed after connection
  - Benefits provided by the integration

- [ ] **Test Business Assets**:
  - Test Ad Account ID: [TEST_AD_ACCOUNT_ID]
  - Test Business ID: [TEST_BUSINESS_ID]

## Compliance & Security

- [ ] **Data Retention Policy**: Clearly documented in privacy policy
- [ ] **SSL Certificate**: Valid and current
- [ ] **Rate Limiting**: Implemented to prevent API abuse
- [ ] **Error Handling**: Graceful handling of API errors with user-friendly messages
