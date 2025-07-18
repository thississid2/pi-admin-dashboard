import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Enhanced website analysis using Python script
async function analyzeWebsite(url: string) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'legit_checker_api_simple.py');
    
    // Execute Python script
    const pythonProcess = spawn('python', [scriptPath, url], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse JSON output from Python script
          const rawResult = JSON.parse(outputData);
          
          // Transform the enhanced result into the format expected by frontend
          const transformedResult = transformPythonResult(rawResult);
          resolve(transformedResult);
        } catch (error) {
          console.error('Failed to parse Python output:', outputData);
          reject(new Error('Failed to parse analysis results'));
        }
      } else {
        console.error('Python script error:', errorData);
        reject(new Error(`Analysis failed with code ${code}: ${errorData}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(new Error('Failed to start analysis process'));
    });
  });
}

// Transform Python script output to frontend-compatible format
function transformPythonResult(pythonResult: any) {
  // The Python script returns detailed results in a different format
  // We need to extract individual check results from the comprehensive analysis
  const results: Array<{check: string, result: string, status: string, score?: number}> = [];
  
  // Transform category scores into individual check results
  if (pythonResult.category_scores) {
    pythonResult.category_scores.forEach((category: any) => {
      const percentage = category.max_score > 0 ? 
        Math.round((category.score / category.max_score) * 100) : 0;
      
      let status = 'success';
      if (percentage < 50) status = 'error';
      else if (percentage < 80) status = 'warning';
      
      results.push({
        check: category.category,
        result: `${category.score}/${category.max_score} (${percentage}%)`,
        status: status,
        score: category.score
      });
    });
  }
  
  // Add overall trust score as a check result
  if (pythonResult.trust_score !== undefined) {
    let status = 'success';
    if (pythonResult.trust_score < 50) status = 'error';
    else if (pythonResult.trust_score < 70) status = 'warning';
    
    results.push({
      check: 'Overall Trust Score',
      result: `${pythonResult.trust_score}% (${pythonResult.trust_level})`,
      status: status,
      score: pythonResult.trust_score
    });
  }
  
  // Add recommendation as a check result
  if (pythonResult.recommendation) {
    const isLowRisk = pythonResult.recommendation.includes('LOW RISK');
    const isModerate = pythonResult.recommendation.includes('MODERATE RISK');
    
    results.push({
      check: 'Onboarding Recommendation',
      result: pythonResult.recommendation,
      status: isLowRisk ? 'success' : isModerate ? 'warning' : 'error'
    });
  }
  
  return {
    domain: pythonResult.domain,
    timestamp: pythonResult.timestamp,
    trust_score: pythonResult.trust_score,
    trust_level: pythonResult.trust_level,
    overall_status: pythonResult.overall_status,
    category_scores: pythonResult.category_scores,
    results: results,
    recommendation: pythonResult.recommendation
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
