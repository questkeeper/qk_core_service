export interface Env {
  TASK_COMPLETE_SERVICE: Fetcher;
  ENVIRONMENT: string;
  DB_CONNECTION_STRING: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  API_KEY: string;
  SUPABASE_JWT_SECRET: string;
}

export type Bindings = {
  [key in keyof Env]: Env[key];
};
