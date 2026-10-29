import { useSubjects } from '../../state/SubjectsContext.js'
import { semesterLabel } from '../../data/subjectDates.js'

export default function SemesterSelect({ className = '', selectClassName = '' }) {
  const { semester, setSemester, semesters } = useSubjects()
  return <label className={`service-field ${className}`}>학기 선택<select aria-label="학기 선택" className={selectClassName} value={semester} onChange={event => setSemester(event.target.value)}><option value="all">전체 학기</option>{semesters.map(value => <option key={value} value={value}>{semesterLabel(value).replace('년', '학년도')}</option>)}</select></label>
}
