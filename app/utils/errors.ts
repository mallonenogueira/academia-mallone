export function handleError(err: unknown, message: string): string {
  console.error(message, err);
  return message;
}
