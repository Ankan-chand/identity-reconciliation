import dotenv from 'dotenv';

dotenv.config(); // Load from .env

export class Config {
  public readonly databaseUrl: string;

  constructor() {
    this.databaseUrl = this.requireEnv('DATABASE_URL');
  }

  private requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}

export const config = new Config();