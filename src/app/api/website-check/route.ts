import { NextRequest, NextResponse } from 'next/server';

// Mock website analysis function
async function analyzeWebsite(url: string) {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  
  // Mock analysis results
  const results = [
    { check: 'HTTPS Connection', result: 'Successful', status: 'success' },
    { check: 'HTTP -> HTTPS Redirect', result: 'Yes', status: 'success' },
    { check: 'Contact Page', result: 'Found', status: 'success' },
    { check: 'Privacy Page', result: 'Found', status: 'success' },
    { check: 'Terms Page', result: 'Found', status: 'success' },
    { check: 'Refund Page', result: Math.random() > 0.5 ? 'Found' : 'Not Found', status: Math.random() > 0.5 ? 'success' : 'warning' },
    { check: 'About Page', result: 'Found', status: 'success' },
    { check: 'Domain Status', result: 'clientTransferProhibited', status: 'success' },
    { check: 'Creation Date', result: '2020-03-15', status: 'success' },
    { check: 'Domain Age', result: '1,765 days (approx. 4 years)', status: 'success' },
    { check: 'Blacklist Status', result: 'Clean', status: 'success' },
  ];

  return {
    domain,
    timestamp: new Date().toISOString(),
    results
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const report = await analyzeWebsite(url);

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
}
