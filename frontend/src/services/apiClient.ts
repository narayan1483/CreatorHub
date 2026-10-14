/**
 * CreatorHub Backend API Client
 * Connects frontend to the Spring Boot REST API
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface ApiError {
  success: boolean;
  status: number;
  error: string;
  message: string;
  path?: string;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
}

export interface BackendHealth {
  status: string;
  service?: string;
  application?: string;
  version?: string;
  profile?: string;
  timestamp?: string;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  status: string;
}

export interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  niche?: string;
  theme?: string;
  role?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserSummary;
  defaultWorkspace: WorkspaceSummary;
}

export interface CreateWorkspacePayload {
  name: string;
  slug: string;
  tagline?: string;
  niche?: string;
  theme?: string;
}

export interface CreateProductPayload {
  title: string;
  slug?: string;
  subtitle?: string;
  type: string;
  price: number;
  badge?: string;
  coverImageUrl?: string;
  deliveryUrl?: string;
  visible?: boolean;
  sortOrder?: number;
}

export interface ProductDto {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  subtitle?: string;
  type: string;
  price: number;
  badge?: string;
  coverImageUrl?: string;
  deliveryUrl?: string;
  visible: boolean;
  sortOrder: number;
  salesCount: number;
}

export interface CreateOrderPayload {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod?: string;
}

export interface OrderDto {
  id: string;
  workspaceId: string;
  productId: string;
  productTitle: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionRef: string;
  createdAt: string;
}

export interface CustomerDto {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone?: string;
  instagramHandle?: string;
  totalSpend: number;
  ordersCount: number;
  segment?: string;
  createdAt: string;
}

export interface CreateWorkflowPayload {
  name: string;
  triggerKeyword: string;
  matchType?: string;
  dmMessageTemplate: string;
  publicReplyTemplate: string;
}

export interface AutomationWorkflowDto {
  id: string;
  name: string;
  triggerKeyword: string;
  matchType: string;
  dmMessageTemplate: string;
  publicReplyTemplate: string;
  status: string;
  runsCount: number;
  followersGained: number;
  buttonClicks: number;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  getAccessToken(): string | null {
    return localStorage.getItem('creatorhub_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('creatorhub_refresh_token');
  }

  setSession(session: AuthSession) {
    localStorage.setItem('creatorhub_access_token', session.accessToken);
    localStorage.setItem('creatorhub_refresh_token', session.refreshToken);
    localStorage.setItem('creatorhub_user', JSON.stringify(session.user));
    if (session.defaultWorkspace) {
      localStorage.setItem('creatorhub_active_workspace', JSON.stringify(session.defaultWorkspace));
    }
  }

  clearSession() {
    localStorage.removeItem('creatorhub_access_token');
    localStorage.removeItem('creatorhub_refresh_token');
    localStorage.removeItem('creatorhub_user');
    localStorage.removeItem('creatorhub_active_workspace');
    localStorage.removeItem('creatorhub_workspaces_cache');
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized by attempting token refresh
    if (response.status === 401 && this.getRefreshToken() && !endpoint.includes('/auth/')) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const newSession = await this.refreshToken();
          this.isRefreshing = false;
          this.onTokenRefreshed(newSession.accessToken);
        } catch (err) {
          this.isRefreshing = false;
          this.clearSession();
          window.dispatchEvent(new CustomEvent('creatorhub_session_expired'));
          throw new Error('Your session has expired. Please log in again.');
        }
      }

      // Wait for the refreshed token
      const retryToken = await new Promise<string>((resolve) => {
        this.addRefreshSubscriber((newToken) => resolve(newToken));
      });

      headers['Authorization'] = `Bearer ${retryToken}`;
      response = await fetch(url, { ...options, headers });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      return {} as T;
    }

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const msg = json.message || json.error || `Request failed with status ${response.status}`;
      const err = new Error(msg) as Error & { fieldErrors?: Record<string, string>; status?: number };
      err.fieldErrors = json.fieldErrors;
      err.status = response.status;
      throw err;
    }

    return (json.data !== undefined ? json.data : json) as T;
  }

  async checkHealth(): Promise<BackendHealth | null> {
    try {
      return await this.request<BackendHealth>('/api/health');
    } catch {
      return null;
    }
  }

  async register(fullName: string, email: string, password: string, handle?: string): Promise<AuthSession> {
    const data = await this.request<AuthSession>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        password,
        workspaceSlug: handle,
      }),
    });
    this.setSession(data);
    return data;
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const data = await this.request<AuthSession>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setSession(data);
    return data;
  }

  async refreshToken(): Promise<AuthSession> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.request<AuthSession>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    this.setSession(data);
    return data;
  }

  async logout(): Promise<void> {
    try {
      if (this.getAccessToken()) {
        await this.request<void>('/api/v1/auth/logout', { method: 'POST' });
      }
    } catch {
      // Ignored if server is unreachable or token already revoked
    } finally {
      this.clearSession();
    }
  }

  async getCurrentUser(): Promise<UserSummary> {
    return await this.request<UserSummary>('/api/v1/auth/me');
  }

  async getWorkspaces(): Promise<WorkspaceSummary[]> {
    return await this.request<WorkspaceSummary[]>('/api/v1/workspaces');
  }

  async createWorkspace(payload: CreateWorkspacePayload): Promise<WorkspaceSummary> {
    return await this.request<WorkspaceSummary>('/api/v1/workspaces', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getWorkspaceBySlug(slug: string): Promise<WorkspaceSummary> {
    return await this.request<WorkspaceSummary>(`/api/v1/workspaces/by-slug/${slug}`);
  }

  async getWorkspaceProducts(workspaceId: string): Promise<ProductDto[]> {
    return await this.request<ProductDto[]>(`/api/v1/workspaces/${workspaceId}/products`);
  }

  async getPublicProducts(workspaceId: string): Promise<ProductDto[]> {
    return await this.request<ProductDto[]>(`/api/v1/workspaces/${workspaceId}/products/public`);
  }

  async createProduct(workspaceId: string, payload: CreateProductPayload): Promise<ProductDto> {
    return await this.request<ProductDto>(`/api/v1/workspaces/${workspaceId}/products`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async toggleProductVisibility(workspaceId: string, productId: string): Promise<ProductDto> {
    return await this.request<ProductDto>(`/api/v1/workspaces/${workspaceId}/products/${productId}/visibility`, {
      method: 'PATCH',
    });
  }

  async deleteProduct(workspaceId: string, productId: string): Promise<void> {
    await this.request<void>(`/api/v1/workspaces/${workspaceId}/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async checkoutOrder(workspaceId: string, payload: CreateOrderPayload): Promise<OrderDto> {
    return await this.request<OrderDto>(`/api/v1/workspaces/${workspaceId}/orders/checkout`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getWorkspaceCustomers(workspaceId: string): Promise<CustomerDto[]> {
    return await this.request<CustomerDto[]>(`/api/v1/workspaces/${workspaceId}/customers`);
  }

  async getWorkspaceOrders(workspaceId: string): Promise<OrderDto[]> {
    return await this.request<OrderDto[]>(`/api/v1/workspaces/${workspaceId}/orders`);
  }

  async getWorkspaceAutomations(workspaceId: string): Promise<AutomationWorkflowDto[]> {
    return await this.request<AutomationWorkflowDto[]>(`/api/v1/workspaces/${workspaceId}/automations`);
  }

  async createAutomationWorkflow(workspaceId: string, payload: CreateWorkflowPayload): Promise<AutomationWorkflowDto> {
    return await this.request<AutomationWorkflowDto>(`/api/v1/workspaces/${workspaceId}/automations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async toggleAutomationWorkflow(workspaceId: string, workflowId: string): Promise<AutomationWorkflowDto> {
    return await this.request<AutomationWorkflowDto>(`/api/v1/workspaces/${workspaceId}/automations/${workflowId}/toggle`, {
      method: 'PATCH',
    });
  }

  async getAutomationExecutions(workspaceId: string) {
    return await this.request(`/api/v1/workspaces/${workspaceId}/automations/executions`);
  }

  async getInstagramDiagnostics(workspaceId: string): Promise<InstagramDiagnosticsDto> {
    return await this.request<InstagramDiagnosticsDto>(`/api/v1/workspaces/${workspaceId}/automations/diagnostics`);
  }

  async connectInstagramAccount(workspaceId: string, payload: {
    accountHandle: string;
    providerAccountId: string;
    accessToken?: string;
  }): Promise<InstagramDiagnosticsDto> {
    return await this.request<InstagramDiagnosticsDto>(`/api/v1/workspaces/${workspaceId}/automations/connect`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async testDryRunComment(workspaceId: string, payload: {
    commentText: string;
    commenterUsername?: string;
    mediaId?: string;
  }) {
    return await this.request(`/api/v1/workspaces/${workspaceId}/automations/diagnostics/test-dry-run`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async simulateComment(workspaceId: string, payload: {
    postInstagramId: string;
    commenterUsername: string;
    commentText: string;
  }) {
    return await this.request(`/api/v1/workspaces/${workspaceId}/automations/simulate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMetaOAuthAuthorizeUrl(workspaceId: string): Promise<{
    authorizationUrl: string;
    state: string;
    appId: string;
    redirectUri: string;
  }> {
    return await this.request<{
      authorizationUrl: string;
      state: string;
      appId: string;
      redirectUri: string;
    }>(`/api/v1/workspaces/${workspaceId}/oauth/instagram/authorize`);
  }

  async exchangeMetaOAuthCode(workspaceId: string, payload: {
    code: string;
    state: string;
  }): Promise<InstagramDiagnosticsDto> {
    return await this.request<InstagramDiagnosticsDto>(`/api/v1/workspaces/${workspaceId}/oauth/instagram/callback`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async disconnectInstagram(workspaceId: string): Promise<InstagramDiagnosticsDto> {
    return await this.request<InstagramDiagnosticsDto>(`/api/v1/workspaces/${workspaceId}/oauth/instagram/disconnect`, {
      method: 'POST',
    });
  }
}

export interface InstagramDiagnosticsDto {
  connected: boolean;
  accountHandle: string;
  providerAccountId: string;
  status: string;
  tokenConfigured: boolean;
  tokenMasked?: string;
  tokenValid: boolean;
  tokenExpiresAt?: string;
  dispatchMode: 'DRY_RUN' | 'LIVE';
  liveModeEnabled: boolean;
  webhook: {
    url: string;
    verifyTokenConfigured: boolean;
    appSecretConfigured: boolean;
    subscribedFields: string[];
    signatureAlgorithm: string;
    reachabilityStatus: string;
  };
  kafka: {
    brokerStatus: string;
    consumerActive: boolean;
    topic: string;
    fallbackQueueActive: boolean;
  };
  engine: {
    activeWorkflowsCount: number;
    totalExecutionsCount: number;
    matchTypesSupported: string[];
  };
  permissions: Array<{
    permission: string;
    required: boolean;
    granted: boolean;
    description: string;
  }>;
  setupChecklist: string[];
}

export const apiClient = new ApiClient();
