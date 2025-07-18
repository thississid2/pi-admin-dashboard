# Pi Admin Dashboard

Internal admin tool for managing merchant onboarding applications and website legitimacy checking.

## Overview

This is the **internal admin dashboard** that works with the Pi Onboarding system. It provides:

-  Merchant management and oversight
-  Document review and approval
-  Website legitimacy checker
-  Real-time statistics and analytics
-  Search and filter capabilities

## Prerequisites

- Node.js 18+ installed
- **Pi Onboarding app running** on http://localhost:3000 (required for data)

## Quick Start

### Option 1: Using Scripts
`ash
# PowerShell
.\start-admin.ps1

# Command Prompt
start-admin.bat
`

### Option 2: Manual Start
`ash
npm install
set PORT=3002
npm run dev
`

## Application URLs

- **Admin Dashboard**: http://localhost:3002
- **Required API**: http://localhost:3000 (Pi Onboarding app)

## Features

###  Dashboard (/)
- Merchant overview with statistics
- Search and filter merchants
- Status-based filtering (approved, pending, rejected)
- Real-time merchant counts

###  Merchant Details (/merchants/[id])
- Complete merchant profile view
- Document management and approval
- Status update capabilities
- Quick actions (email, reports)

###  Website Checker (/website-checker)
- Website legitimacy analysis
- Python-powered checking algorithms
- PDF report generation
- Risk assessment scoring

## Dependencies

### API Connection
The admin dashboard requires the **Pi Onboarding app** to be running on localhost:3000 for:
- Merchant data retrieval
- Status updates
- Document information

### Python Integration
- scripts/legit_checker.py - Website analysis
- scripts/legit_checker_api.py - API interface

## Environment Variables

Create .env.local:
`env
NEXT_PUBLIC_APP_NAME="Pi Admin Dashboard"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
NEXT_PUBLIC_ONBOARDING_API_URL="http://localhost:3000"
PYTHON_SCRIPTS_PATH="./scripts"
NEXT_PUBLIC_ENABLE_PDF_REPORTS=true
NEXT_PUBLIC_WEBSITE_CHECKER_ENABLED=true
`

## Running Both Applications

To run the complete system:

1. **Start Pi Onboarding** (in separate terminal):
   `ash
   cd c:\Users\offic\Desktop\pi-onboarding
   npm run dev
   `

2. **Start Admin Dashboard**:
   `ash
   cd c:\Users\offic\Desktop\pi-admin-dashboard
   .\start-admin.ps1
   `

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Custom SVG library
- **Python**: Website analysis scripts

## Troubleshooting

### API Connection Issues
- Ensure Pi Onboarding app is running on localhost:3000
- Check CORS headers in browser developer tools
- Verify environment variables

### Port Conflicts
`ash
# Use different port
set PORT=3003
npm run dev
`

### Python Script Issues
- Ensure Python is installed
- Check scripts/ directory exists
- Verify script permissions

## Deployment

This admin dashboard is designed to be deployed separately from the onboarding app:

1. **Production Environment Variables**:
   `env
   NEXT_PUBLIC_ONBOARDING_API_URL="https://your-onboarding-domain.com"
   `

2. **Independent Hosting**: Deploy to any Node.js hosting service

3. **Separate Repository**: This can be moved to its own Git repository

## Development

### Adding Features
- New pages go in src/app/
- Components in src/components/
- API integrations use environment URLs

### Database Integration
- Update API calls to use production endpoints
- Admin dashboard automatically adapts to real data

## Support

For development issues:
1. Check both applications are running
2. Verify API connectivity
3. Check browser console for errors
4. Ensure all dependencies are installed
