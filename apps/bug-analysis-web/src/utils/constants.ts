const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const Constants = Object.freeze({
  BACKEND_URL,
} as const);

export default Constants;
