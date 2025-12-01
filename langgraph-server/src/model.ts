export interface Model {
  generate(prompt: string): Promise<string>
}

/**
 * DummyModel is a simple implementation that can be replaced
 * by a real model adapter (OpenAI, Anthropic, etc.) without changing callers.
 */
export class DummyModel implements Model {
  async generate(prompt: string): Promise<string> {
    // placeholder behaviour — replace with real API call
    return `DummyModel result for prompt: ${prompt}`
  }
}
