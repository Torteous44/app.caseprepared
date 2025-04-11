# Google OAuth Setup Instructions

## Overview

This document provides instructions to set up and troubleshoot Google OAuth authentication for the Case Prepared application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to the Google Cloud Console
3. Permission to create OAuth credentials

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top of the page
3. Click "New Project"
4. Enter a project name and click "Create"

### 2. Configure the OAuth Consent Screen

1. In your new project, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless this is an internal corporate app)
3. Fill out the required fields:
   - App name: "Case Prepared"
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Add necessary scopes (at minimum):
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
6. Click "Save and Continue" 
7. Add test users if you're in testing mode
8. Click "Save and Continue"
9. Review your settings and click "Back to Dashboard"

### 3. Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name: "Case Prepared Web Client"
5. Add authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: Your production domain (e.g., `https://caseprepared.com`)
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000`
   - Production: Your production domain (e.g., `https://caseprepared.com`)
   - **IMPORTANT**: Make sure to include both with and without trailing slash
     - `http://localhost:3000`
     - `http://localhost:3000/`
     - `https://caseprepared.com`
     - `https://caseprepared.com/`
7. Click "Create"
8. Note the Client ID that appears in the modal

### 4. Update Application Configuration

1. Add your Client ID to the `.env` file:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```
2. Also add it to `public/index.html` for direct access:
   ```html
   <script>
     window.GOOGLE_CLIENT_ID = "your_client_id_here";
   </script>
   ```

## Troubleshooting Common Issues

### Error: "Missing required parameter: client_id"

This error occurs when Google OAuth can't find a valid client ID. Possible fixes:

1. Check that your Client ID is correctly set in both `.env` and `index.html`
2. Make sure the `GoogleLoginButton` component can access the Client ID
3. Verify that the Client ID is valid and belongs to your project
4. Check the JavaScript console for additional error messages
5. Ensure the application domain is added to authorized JavaScript origins

### Error: "redirect_uri_mismatch"

This error occurs when the redirect URI doesn't match what's configured in Google Cloud Console:

1. Go to Google Cloud Console > "APIs & Services" > "Credentials"
2. Edit your OAuth client ID
3. Check that your current URL exactly matches one of the authorized redirect URIs
4. Add multiple variations of your redirect URIs:
   - With and without trailing slash: `http://localhost:3000` and `http://localhost:3000/`
   - With and without `www`: `https://caseprepared.com` and `https://www.caseprepared.com`
   - With specific callback paths if your app uses them: `https://caseprepared.com/auth/callback`
5. For localhost testing, use exactly `http://localhost:3000` (not 127.0.0.1)
6. After updating the redirect URIs, save changes and wait a few minutes for them to take effect
7. Clear your browser cache or try in an incognito window
8. Make sure you're testing on exactly the same domain/URL that's configured

### Error: "invalid_request"

This is a generic error that could be caused by several issues:

1. Check that your OAuth consent screen is properly configured
2. Verify that you've enabled the necessary APIs (Google Identity Services API)
3. Make sure the Client ID is for a Web application type
4. Check for any JavaScript errors preventing the Google Sign-In library from initializing

## Implementation Notes

- The Google Sign-In button is rendered dynamically through the Google Identity Services library
- The application uses the one-tap sign-in flow
- After successful authentication with Google, the token is sent to the backend for verification
- The backend validates the token and issues a JWT for subsequent authenticated requests

## References

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google OAuth 2.0 for Client-side Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow) 