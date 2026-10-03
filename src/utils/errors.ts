export function isAuthRequiredError(error: unknown): boolean {
  const anyErr = error as any;
  return anyErr?.message === 'AUTH_REQUIRED' || anyErr?.status === 401;
}

