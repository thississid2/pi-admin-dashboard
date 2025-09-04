import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Test different connection scenarios
    const { Pool } = require('pg');
    
    // Log environment variables (without password)
    console.log('Environment variables loaded:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
    console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length);
    
    // Test connection with explicit config
    const testConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000
    };
    
    console.log('Testing connection with config:', {
      ...testConfig,
      password: testConfig.password ? '***hidden***' : 'undefined'
    });
    
    const pool = new Pool(testConfig);
    
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      client.release();
      await pool.end();
      
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        data: result.rows[0],
        config: {
          host: testConfig.host,
          port: testConfig.port,
          database: testConfig.database,
          user: testConfig.user,
          ssl: testConfig.ssl
        }
      });
    } catch (dbError: any) {
      await pool.end();
      throw dbError;
    }
    
  } catch (error: any) {
    console.error("Database test error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: {
        message: error.message,
        code: error.code,
        severity: error.severity,
        detail: error.detail
      },
      suggestions: [
        "Check if the database credentials are correct",
        "Verify the database server is accessible",
        "Check if the user has proper permissions",
        "Ensure the database exists",
        "Check if special characters in password need URL encoding"
      ]
    }, { status: 500 });
  }
}
