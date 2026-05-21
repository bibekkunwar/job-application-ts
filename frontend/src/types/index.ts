export interface JobApplication {
  job_id: string;
  user_id: string;
  company_name: string;
  role: string;
  status: string;
  platform: string;
  notes?: string;
  job_url?: string;
  date_applied: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStatus {
  app_id: string;
  job_id: string;
  round: string;
  round_status: string;
  notes?: string;
  created_at: string;
  date: string;
}
