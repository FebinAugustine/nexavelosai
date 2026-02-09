export class ApiResponse<T = any> {
  data?: T;
  message?: string;
  statusCode: number;
  timestamp: string;
}
