import { IApiService } from "../interfaces/IApiService";
import { ICacheService } from "../interfaces/ICacheService";
import {
  IContributorRequestService,
  ContributorRequestPayload,
  ContributorRequestResponse,
} from "../interfaces/IContributorRequestService";

export class ContributorRequestService implements IContributorRequestService {
  private readonly basePath = "/contributor-requests";
  private readonly cacheKey = "contributor-requests:hasExisting";

  constructor(private api: IApiService, private cache: ICacheService) {}

  async createRequest(
    payload: ContributorRequestPayload
  ): Promise<ContributorRequestResponse> {
    const res = await this.api.post<
      ContributorRequestResponse,
      ContributorRequestPayload
    >(this.basePath, payload);
    // Invalidate cache
    await this.cache.delete(this.cacheKey);
    return res.data;
  }

  async hasExistingRequest(): Promise<boolean> {
    const cached = await this.cache.get<boolean>(this.cacheKey);
    if (typeof cached === "boolean") return cached;

    try {
      // Simple existence check: GET my request (server returns 200 if exists, 404 if not)
      const res = await this.api.get<{ exists: boolean }>(
        `${this.basePath}/me`
      );
      await this.cache.set(this.cacheKey, res.data.exists, 5 * 60 * 1000); // 5 min TTL
      return res.data.exists;
    } catch (e: any) {
      // If 404, treat as not existing
      if (e?.status === 404 || e?.status === 401 || e?.status === 403) {
        await this.cache.set(this.cacheKey, false, 5 * 60 * 1000);
        return false;
      }
      throw e;
    }
  }
}
