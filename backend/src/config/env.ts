import { config as loadEnv } from "dotenv";

loadEnv();

export type AppEnv = {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  cookieSecret: string;
  frontendOrigin: string;
  nodeEnv: string;
};

export function getEnv(): AppEnv {
  return {
    port: Number(process.env.PORT || 3001),
    databaseUrl: process.env.DATABASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || "dev-jwt-secret-change-me",
    cookieSecret: process.env.COOKIE_SECRET || "dev-cookie-secret-change-me",
    frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV || "development"
  };
}
