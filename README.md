# Case Prepared - Authenticated Application

This is the authenticated application for Case Prepared, an AI-powered platform for case interview practice. This application is designed for authenticated users only and works in conjunction with the marketing site at [caseprepared.com](https://caseprepared.com).

## Overview

This application (app.caseprepared.com) handles all authenticated user flows including:

- Interview practice sessions
- User profile management
- Subscription management
- Resources and educational content

## Architecture

This application is part of a split architecture:
- **Marketing Site** (caseprepared.com): Handles public content, landing pages, and initial authentication
- **Authenticated App** (app.caseprepared.com): This repository - handles all authenticated user interactions

## Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Environment Variables
Create a `.env` file with the following:

```
REACT_APP_API_URL=http://localhost:8000 # Backend API URL
```

## Deployment

The application is deployed using Vercel. The main branch is automatically deployed to production.

## Related Repositories

- Backend API: [github.com/caseprepared/backend](https://github.com/caseprepared/backend)
- Marketing Site: [github.com/caseprepared/marketing](https://github.com/caseprepared/marketing)