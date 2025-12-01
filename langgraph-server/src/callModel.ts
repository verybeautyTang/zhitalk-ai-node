import { Model, DummyModel } from './model'

let defaultModel: Model | null = null

export const getModel = (): Model => {
  if (!defaultModel) {
    // swap implementation here to use a real provider
    defaultModel = new DummyModel()
  }
  return defaultModel
}

export const callModel = async (prompt: string): Promise<string> => {
  const model = getModel()
  return model.generate(prompt)
}
