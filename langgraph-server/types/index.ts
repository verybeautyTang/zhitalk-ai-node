export interface AgentRequest {
  input: string
  context?: Record<string, any>
}

export interface AgentResponse {
  output: string
  status: 'success' | 'error'
  errorMessage?: string
}
