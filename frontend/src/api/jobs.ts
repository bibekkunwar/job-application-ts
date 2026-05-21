import type { JobApplication, ApplicationStatus } from "../types";
import { BASE_URL } from "./config";

export const getAllJobs = async (token: string) => {
  try {
    const resposne = await fetch(`${BASE_URL}/api/jobs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    const data = await resposne.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch all the jobs", error);
    throw error;
  }
};

export const getJobById = async (token: string, id: string) => {
  try {
    const resposne = await fetch(`${BASE_URL}/api/jobs/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await resposne.json();
    return data;
  } catch (error) {
    console.error("Failed to get the job", error);
    throw error;
  }
};

export const createJob = async (
  token: string,
  jobData: Partial<JobApplication>,
) => {
  try {
    const resposne = await fetch(`${BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const data = await resposne.json();
    return data;
  } catch (error) {
    console.error("Failed to create an application", error);
    throw error;
  }
};

export const updateJob = async (
  token: string,
  id: string,
  updateData: JobApplication,
) => {
  try {
    const resposne = await fetch(`${BASE_URL}/api/jobs/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const data = await resposne.json();
    return data;
  } catch (error) {
    console.error("Failed to update an application", error);
    throw error;
  }
};

export const deleteJob = async (token: string, id: string) => {
  try {
    const resposne = await fetch(`${BASE_URL}/api/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await resposne.json();
    return data;
  } catch (error) {
    console.error("Failed to delete the application", error);
    throw error;
  }
};

export const getStatusByJobId = async (
  token: string,
  jobId: string,
): Promise<ApplicationStatus[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs/${jobId}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (error) {
    console.error("Failed to fetch interview rounds", error);
    throw error;
  }
};

export const createStatus = async (
  token: string,
  jobId: string,
  statusData: Partial<ApplicationStatus>,
): Promise<ApplicationStatus[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs/${jobId}/status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusData),
    });
    return response.json();
  } catch (error) {
    console.error("Failed to add interview round", error);
    throw error;
  }
};

export const deleteStatus = async (
  token: string,
  jobId: string,
  statusId: string,
): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/api/jobs/${jobId}/status/${statusId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to delete interview round", error);
    throw error;
  }
};
