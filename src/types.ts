export type SessionDateTime = {
  day: number
  month: number
  year: number
  start_time: number
  end_time: number
  weekday: number
}

export type Session = {
  session_id: number
  session_index: number
  class_name: string
  class_code: string
  session_chapter: string
  total_students: number
  students_number: number
  session_type: string
  session_state?: string
  datetime: SessionDateTime
}

export type CheckinState = 'MISSED' | 'NO_INFO' | 'INTIME' | 'LATE' | 'AVAILABLE'

export type Checkin = {
  checkin_id: number
  checkin_datetime: number
  state: CheckinState
  note: string
}

export type AttendanceStatus = 'YES' | 'NO'

export type Student = {
  student_id: number
  student_status: string
  full_name: string
  attendance_status: AttendanceStatus | string
  avatar: string
  chat_id: string
}

export type EvaluationPointAnswer = {
  name: string
  point: number
}

export type Evaluation = {
  id: number
  name: string
  type: string
  sequence: string
  list_answers: string[]
  list_point_answers: EvaluationPointAnswer[]
  group: {
    id?: number
    name?: string
  }
}

export type EvaluatedCriteria = {
  id: number
  name: string
  type: string
  sequence: string
  answer: string
  point: number
}

export type EvaluationPayload = {
  id: number
  name: string
  evaluated_criterias: EvaluatedCriteria[]
}

export type StudentEvaluationStatus = {
  studentId: number
  status: boolean
  evaluation: EvaluatedCriteria[] | Record<string, never>
}

export type FieldErrors = Record<string, string[]>
