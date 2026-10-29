import { createContext, useContext } from 'react'
export const DemoContext = createContext(null)
export function useDemo() {
  const value = useContext(DemoContext)
  if (!value) throw new Error('DemoProvider is required')
  return value
}
