export type ToolResult = {
  success: boolean
  output?: unknown
  error?: string
}

export class ToolNode {
  name: string
  handler: (input: unknown) => Promise<ToolResult>

  constructor(name: string, handler: (input: unknown) => Promise<ToolResult>) {
    this.name = name
    this.handler = handler
  }

  async run(input: unknown): Promise<ToolResult> {
    try {
      return await this.handler(input)
    } catch (err: any) {
      return { success: false, error: err?.message ?? String(err) }
    }
  }
}
