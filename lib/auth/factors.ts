export type AuthFactor = 'password' | 'passkey';

export interface AuthFactorProvider {
  kind: AuthFactor;
  verify(userId: string, proof: string): Promise<boolean>;
}

export const passwordFactorReady = true;
