/* eslint-disable react-refresh/only-export-components -- Test-only mounting entry point, not an app module. */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import DashboardTasks from '../../src/components/dashboard/DashboardTasks.jsx'

let root
let revision = 0
function CourseFixture({ initialCourses }) {
  const [courses, setCourses] = useState(initialCourses)
  return <DashboardTasks courses={courses} onToggleCancel={id => setCourses(current => current.map(course => course.id === id ? { ...course, cancelled: !course.cancelled } : course))} />
}
export function mountCourses(courses) {
  if (!root) {
    const host = document.createElement('div')
    host.style.display = 'contents'
    document.querySelector('.dashboard-tasks').replaceWith(host)
    root = createRoot(host)
  }
  root.render(<MemoryRouter><CourseFixture key={++revision} initialCourses={courses} /></MemoryRouter>)
}
