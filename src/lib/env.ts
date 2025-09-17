// Environment variables type definitions and validation

interface EnvironmentVariables {
  // App Configuration
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_NAME: string;
  NEXT_PUBLIC_APP_VERSION: string;
  
  // Development
  NEXT_PUBLIC_SKIP_AUTH?: string;
  
  // AWS Configuration
  NEXT_PUBLIC_LAMBDA_API_URL: string;
  AWS_REGION: string;
  
  // Cognito Configuration
  COGNITO_USER_POOL_ID: string;
  COGNITO_CLIENT_ID: string;
  COGNITO_DOMAIN: string;
  
  // Database Configuration
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  
  // API Configuration
  API_TIMEOUT: string;
}

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: Partial<EnvironmentVariables> = {};

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadConfig() {
    // Client-side environment variables (NEXT_PUBLIC_*)
    if (typeof window !== 'undefined') {
      this.config = {
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Pi Admin Dashboard',
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
        NEXT_PUBLIC_SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH,
        NEXT_PUBLIC_LAMBDA_API_URL: process.env.NEXT_PUBLIC_LAMBDA_API_URL || 'https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev',
      };
    } else {
      // Server-side environment variables
      this.config = {
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Pi Admin Dashboard',
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
        NEXT_PUBLIC_SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH,
        NEXT_PUBLIC_LAMBDA_API_URL: process.env.NEXT_PUBLIC_LAMBDA_API_URL || 'https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev',
        AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
        COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || '',
        COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || '',
        COGNITO_DOMAIN: process.env.COGNITO_DOMAIN || '',
        DB_HOST: process.env.DB_HOST || '',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_NAME: process.env.DB_NAME || '',
        DB_USER: process.env.DB_USER || '',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        API_TIMEOUT: process.env.API_TIMEOUT || '30000',
      };
    }
  }

  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] | undefined {
    return this.config[key];
  }

  getRequired<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    const value = this.config[key];
    if (value === undefined || value === '') {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  shouldSkipAuth(): boolean {
    return this.isDevelopment() && this.get('NEXT_PUBLIC_SKIP_AUTH') === 'true';
  }

  // Convenience getters for commonly used values
  get appName(): string {
    return this.get('NEXT_PUBLIC_APP_NAME') || 'Pi Admin Dashboard';
  }

  get appVersion(): string {
    return this.get('NEXT_PUBLIC_APP_VERSION') || '0.1.0';
  }

  get lambdaApiUrl(): string {
    return this.get('NEXT_PUBLIC_LAMBDA_API_URL') || 'https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev';
  }

  get awsRegion(): string {
    return this.get('AWS_REGION') || 'ap-south-1';
  }

  get apiTimeout(): number {
    return parseInt(this.get('API_TIMEOUT') || '30000', 10);
  }

  // Validation method
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredVars: (keyof EnvironmentVariables)[] = [
      'NEXT_PUBLIC_LAMBDA_API_URL',
    ];

    // Only validate server-side vars on server
    if (typeof window === 'undefined') {
      requiredVars.push(
        'AWS_REGION',
        'COGNITO_USER_POOL_ID',
        'COGNITO_CLIENT_ID',
        'COGNITO_DOMAIN'
      );
    }

    for (const varName of requiredVars) {
      try {
        this.getRequired(varName);
      } catch (error) {
        errors.push(`${varName} is required but not set`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const env = EnvironmentConfig.getInstance();

// Export validation function for use in app startup
export const validateEnvironment = () => {
  const validation = env.validate();
  if (!validation.isValid) {
    console.error('Environment validation failed:', validation.errors);
    if (env.isProduction()) {
      throw new Error('Required environment variables are missing');
    }
  }
  return validation;
};