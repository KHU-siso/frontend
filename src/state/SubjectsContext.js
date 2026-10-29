import { createContext, useContext } from 'react'
export const SubjectsContext = createContext(null)
export function useSubjects() {
  const value = useContext(SubjectsContext)
  if (!value) throw new Error('SubjectsProvider is required')
  return value
}
