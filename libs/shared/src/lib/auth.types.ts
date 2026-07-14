export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  tenantId: string;
  roles: string[];
  permissions: string[];
  tenant?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string; // userId
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
}
