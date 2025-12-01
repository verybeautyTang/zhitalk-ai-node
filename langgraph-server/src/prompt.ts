export const buildPrompt = (input: string) => {
  // keep prompts centralized and easy to extend
  return `Please process the following input and return a concise result:\n\n${input}`
}
