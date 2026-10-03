export async function readResponseBodySafe(response: Response) {
  try {
    const text = await response.text();
    return text.length > 2000 ? `${text.slice(0, 2000)}...(truncated)` : text;
  } catch {
    return '(failed to read body)';
  }
}

export function devErrorLog(_message: string, _details?: Record<string, unknown>) {
  return;
}
