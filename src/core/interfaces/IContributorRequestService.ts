export interface ContributorRequestPayload {
  motivation: string;
  experience?: string;
  languages?: string;
  commitment: boolean;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

export interface ContributorRequestResponse {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface IContributorRequestService {
  createRequest(
    payload: ContributorRequestPayload
  ): Promise<ContributorRequestResponse>;
  hasExistingRequest(): Promise<boolean>;
}
