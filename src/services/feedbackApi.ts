import { API_BASE_URL } from '../constants/api';

export async function submitFeedback(message: string) {
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`FEEDBACK_SUBMIT_FAILED:${response.status}`);
  }

  return response.json();
}
