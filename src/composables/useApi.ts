import type {
  AttendanceStatus,
  Checkin,
  EvaluationPayload,
  FieldErrors,
  Session,
  Student,
  StudentEvaluationStatus,
} from '@/types'

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  errors?: FieldErrors
  token?: string
  data?: T
}

type LoginPayload = {
  mobile_number: string
  password: string
}

type LoginResult = {
  success: boolean
  message: string
  errors: FieldErrors
  token: string
}

type SessionsPayload = {
  data?: {
    list_sessions?: Session[]
  }
}

type StudentsPayload = {
  list_students?: Array<{ list_students?: Student[] } | Student>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888/api'
const TOKEN_KEY = 'session_id'

class ApiError extends Error {
  status: number
  errors: FieldErrors

  constructor(message: string, status: number, errors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY)
export const hasStoredToken = () => Boolean(getStoredToken())

export function useApi() {
  const request = async <T>(path: string, options: RequestInit & { auth?: boolean } = {}) => {
    const { auth = true, headers, ...init } = options
    const token = getStoredToken()
    const requestHeaders = new Headers(headers)

    if (auth && token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
    console.log(`${API_BASE_URL}${path}`)
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders,
    })

    const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>

    if (!response.ok) {
      throw new ApiError(payload.message ?? 'Request failed', response.status, payload.errors)
    }

    return payload
  }

  const login = async (payload: LoginPayload): Promise<LoginResult> => {
    const result = await request<never>('/login', {
      auth: false,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return {
      success: Boolean(result.success),
      message: result.message ?? '',
      errors: result.errors ?? {},
      token: result.token ?? '',
    }
  }

  const getSessions = async (fromDate: string, toDate: string) => {
    const params = new URLSearchParams({
      from_date: fromDate,
      to_date: toDate,
    })
    const result = await request<SessionsPayload>(`/class-sessions?${params.toString()}`)

    return result.data?.data?.list_sessions ?? []
  }

  const getSession = async (sessionId: string | number) => {
    const result = await request<Session>(`/class-sessions/${sessionId}`)

    return result.data ?? null
  }

  const getCheckin = async (sessionId: string | number) => {
    const result = await request<Checkin>(`/class-sessions/${sessionId}/checkin`)

    return result.data ?? null
  }

  const createCheckin = async (sessionId: string | number) => {
    const result = await request<Checkin>(`/class-sessions/${sessionId}/checkin`, {
      method: 'POST',
    })

    return result.data ?? null
  }

  const getStudents = async (sessionId: string | number) => {
    const result = await request<StudentsPayload>(`/class-sessions/${sessionId}/students`)
    const groups = result.data?.list_students ?? []

    return groups.flatMap((group) => {
      if ('list_students' in group) {
        return group.list_students ?? []
      }

      return group
    })
  }

  const markAttendance = async (
    sessionId: string | number,
    studentId: number,
    status: AttendanceStatus,
  ) => {
    const params = new URLSearchParams({ status })

    await request(
      `/class-sessions/${sessionId}/students/${studentId}/attendance?${params.toString()}`,
      {
        method: 'POST',
      },
    )
  }

  const updateTotalStudents = async (sessionId: string | number, totalStudents: number) => {
    const result = await request<Session>(`/class-sessions/${sessionId}/set-total-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        total_students: totalStudents,
      }),
    })

    return result.data ?? null
  }

  const evaluateStudent = async (
    sessionId: string | number,
    studentId: string | number,
    evaluation: EvaluationPayload,
  ) => {
    console.log(evaluation)
    const result = await request(`/class-sessions/${sessionId}/students/${studentId}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluation),
    })

    return result.data ?? null
  }

  const getEvaluations = async (sessionId: string | number) => {
    const result = (await request<StudentEvaluationStatus[]>(
      `/class-sessions/${sessionId}/evaluations`,
    )) as unknown as StudentEvaluationStatus[] | ApiEnvelope<StudentEvaluationStatus[]>

    if (Array.isArray(result)) {
      return result
    }

    return result.data ?? []
  }

    return {
      ApiError,
      clearStoredToken,
      createCheckin,
      getCheckin,
      getSession,
      getSessions,
      getStudents,
      getEvaluations,
      getStoredToken,
      hasStoredToken,
      login,
      markAttendance,
      setStoredToken,
      updateTotalStudents,
      evaluateStudent,
    }
  }
