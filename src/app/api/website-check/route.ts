import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';

interface CheckResult {
  check: string;
  result: string;
  status: 'success' | 'warning' | 'error';
  score?: number;
}

interface CategoryScore {
  category: string;
  score: number;
  max_score: number;
}

// Comprehensive website analysis function
async function analyzeWebsite(domain: string) {
  const results: CheckResult[] = [];
  let totalScore = 0;
  let maxScore = 0;

  try {
    // 1. HTTPS Connection Test
    const httpsResult = await checkHTTPS(domain);
    results.push(httpsResult);
    totalScore += httpsResult.score || 0;
    maxScore += 10;

    // 2. HTTP to HTTPS Redirect Test
    const redirectResult = await checkHTTPRedirect(domain);
    results.push(redirectResult);
    totalScore += redirectResult.score || 0;
    maxScore += 8;

    // 3. Essential Pages Check
    const pagesResults = await checkEssentialPages(domain);
    results.push(...pagesResults);
    pagesResults.forEach(r => {
      totalScore += r.score || 0;
      maxScore += 5;
    });

    // 4. Domain Age Estimation (simplified)
    const domainAgeResult = await estimateDomainAge(domain);
    results.push(domainAgeResult);
    totalScore += domainAgeResult.score || 0;
    maxScore += 15;

    // 5. Basic Security Headers Check
    const securityResult = await checkSecurityHeaders(domain);
    results.push(securityResult);
    totalScore += securityResult.score || 0;
    maxScore += 10;

    // Calculate trust score
    const trustScore = Math.round((totalScore / maxScore) * 100);
    const trustLevel = getTrustLevel(trustScore);
    const recommendation = getRecommendation(trustScore);

    // Create category scores
    const categoryScores: CategoryScore[] = [
      {
        category: 'Security & HTTPS',
        score: (results.find(r => r.check === 'HTTPS Connection')?.score || 0) + 
               (results.find(r => r.check === 'Security Headers')?.score || 0),
        max_score: 20
      },
      {
        category: 'Website Structure',
        score: pagesResults.reduce((sum, r) => sum + (r.score || 0), 0),
        max_score: pagesResults.length * 5
      },
      {
        category: 'Domain Trust',
        score: (results.find(r => r.check === 'Domain Age')?.score || 0) + 
               (results.find(r => r.check === 'HTTP -> HTTPS Redirect')?.score || 0),
        max_score: 23
      }
    ];

    return {
      domain,
      timestamp: new Date().toISOString(),
      trust_score: trustScore,
      trust_level: trustLevel,
      overall_status: trustScore >= 70 ? 'good' : trustScore >= 50 ? 'moderate' : 'poor',
      category_scores: categoryScores,
      results,
      recommendation
    };

  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to complete website analysis');
  }
}

// Check HTTPS connectivity
async function checkHTTPS(domain: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    const url = `https://${domain}`;
    const req = https.get(url, { timeout: 10000 }, (res) => {
      resolve({
        check: 'HTTPS Connection',
        result: 'Successful',
        status: 'success',
        score: 10
      });
    });

    req.on('error', () => {
      resolve({
        check: 'HTTPS Connection',
        result: 'Failed',
        status: 'error',
        score: 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        check: 'HTTPS Connection',
        result: 'Timeout',
        status: 'error',
        score: 0
      });
    });
  });
}

// Check HTTP to HTTPS redirect
async function checkHTTPRedirect(domain: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    const url = `http://${domain}`;
    const req = http.get(url, { timeout: 10000 }, (res) => {
      const hasRedirect = res.statusCode === 301 || res.statusCode === 302;
      const redirectsToHTTPS = res.headers.location?.startsWith('https://');
      
      if (hasRedirect && redirectsToHTTPS) {
        resolve({
          check: 'HTTP -> HTTPS Redirect',
          result: 'Yes',
          status: 'success',
          score: 8
        });
      } else if (hasRedirect) {
        resolve({
          check: 'HTTP -> HTTPS Redirect',
          result: 'Redirects but not to HTTPS',
          status: 'warning',
          score: 4
        });
      } else {
        resolve({
          check: 'HTTP -> HTTPS Redirect',
          result: 'No',
          status: 'warning',
          score: 2
        });
      }
    });

    req.on('error', () => {
      resolve({
        check: 'HTTP -> HTTPS Redirect',
        result: 'Unable to test',
        status: 'warning',
        score: 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        check: 'HTTP -> HTTPS Redirect',
        result: 'Timeout',
        status: 'warning',
        score: 0
      });
    });
  });
}

// Check for essential pages
async function checkEssentialPages(domain: string): Promise<CheckResult[]> {
  const pages = [
    { path: '/contact', name: 'Contact Page' },
    { path: '/privacy', name: 'Privacy Page' },
    { path: '/terms', name: 'Terms Page' },
    { path: '/about', name: 'About Page' },
    { path: '/refund', name: 'Refund Page' }
  ];

  const results = await Promise.all(
    pages.map(page => checkPageExists(domain, page.path, page.name))
  );

  return results;
}

// Check if a specific page exists
async function checkPageExists(domain: string, path: string, pageName: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    const url = `https://${domain}${path}`;
    const req = https.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode && res.statusCode < 400) {
        resolve({
          check: pageName,
          result: 'Found',
          status: 'success',
          score: 5
        });
      } else {
        resolve({
          check: pageName,
          result: 'Not Found',
          status: 'warning',
          score: 2
        });
      }
    });

    req.on('error', () => {
      resolve({
        check: pageName,
        result: 'Not Found',
        status: 'warning',
        score: 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        check: pageName,
        result: 'Timeout',
        status: 'warning',
        score: 0
      });
    });
  });
}

// Estimate domain age (simplified - in production you'd use WHOIS API)
async function estimateDomainAge(domain: string): Promise<CheckResult> {
  // This is a simplified estimation - in production you'd use a WHOIS service
  // For now, we'll use a heuristic based on domain characteristics
  const commonTLDs = ['.com', '.org', '.net', '.edu', '.gov'];
  const isCommonTLD = commonTLDs.some(tld => domain.endsWith(tld));
  const domainLength = domain.replace(/\.[^.]+$/, '').length;
  
  // Simple heuristic scoring
  let ageScore = 5; // base score
  if (isCommonTLD) ageScore += 5;
  if (domainLength > 5 && domainLength < 15) ageScore += 3;
  if (!domain.includes('-') && !domain.match(/\d/)) ageScore += 2;

  const estimatedAge = Math.min(15, ageScore);
  
  return {
    check: 'Domain Age',
    result: `Estimated as ${estimatedAge >= 10 ? 'mature' : estimatedAge >= 5 ? 'established' : 'new'} domain`,
    status: estimatedAge >= 10 ? 'success' : estimatedAge >= 5 ? 'warning' : 'error',
    score: estimatedAge
  };
}

// Check basic security headers
async function checkSecurityHeaders(domain: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    const url = `https://${domain}`;
    const req = https.get(url, { timeout: 10000 }, (res) => {
      const headers = res.headers;
      let securityScore = 0;
      const securityFeatures = [];

      if (headers['strict-transport-security']) {
        securityScore += 3;
        securityFeatures.push('HSTS');
      }
      if (headers['x-frame-options']) {
        securityScore += 2;
        securityFeatures.push('X-Frame-Options');
      }
      if (headers['x-content-type-options']) {
        securityScore += 2;
        securityFeatures.push('X-Content-Type-Options');
      }
      if (headers['content-security-policy']) {
        securityScore += 3;
        securityFeatures.push('CSP');
      }

      const result = securityFeatures.length > 0 
        ? `${securityFeatures.join(', ')} enabled`
        : 'Basic security headers missing';

      resolve({
        check: 'Security Headers',
        result,
        status: securityScore >= 7 ? 'success' : securityScore >= 3 ? 'warning' : 'error',
        score: securityScore
      });
    });

    req.on('error', () => {
      resolve({
        check: 'Security Headers',
        result: 'Unable to check',
        status: 'warning',
        score: 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        check: 'Security Headers',
        result: 'Timeout',
        status: 'warning',
        score: 0
      });
    });
  });
}

// Get trust level based on score
function getTrustLevel(score: number): string {
  if (score >= 85) return 'EXCELLENT';
  if (score >= 70) return 'HIGH';
  if (score >= 55) return 'MODERATE';
  if (score >= 40) return 'LOW';
  return 'VERY LOW';
}

// Get recommendation based on score
function getRecommendation(score: number): string {
  if (score >= 85) {
    return 'LOW RISK - This website demonstrates excellent security practices and legitimacy indicators. Safe to proceed with onboarding.';
  } else if (score >= 70) {
    return 'LOW RISK - This website shows good security practices with minor areas for improvement. Generally safe for onboarding.';
  } else if (score >= 55) {
    return 'MODERATE RISK - This website has some legitimacy concerns. Consider additional verification before onboarding.';
  } else if (score >= 40) {
    return 'ELEVATED RISK - This website shows several red flags. Exercise caution and perform thorough due diligence.';
  } else {
    return 'HIGH RISK - This website has significant legitimacy and security concerns. Not recommended for onboarding without extensive verification.';
  }
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

    // Clean and normalize the domain
    let domain = url;
    
    // Remove protocol if present
    domain = domain.replace(/^https?:\/\//, '');
    
    // Remove www if present
    domain = domain.replace(/^www\./, '');
    
    // Remove path and parameters
    domain = domain.split('/')[0].split('?')[0];

    // Validate domain format
    if (!domain || !domain.includes('.')) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    const report = await analyzeWebsite(domain);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Website analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze website' },
      { status: 500 }
    );
  }
}
