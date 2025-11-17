export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: 'ADMIN' | 'MEMBER';
  tenantId: string;
}
