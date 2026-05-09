<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CheckinButton from '@/components/CheckinButton.vue'
import EvaluationForm from '@/components/EvaluationForm.vue'
import StudentAttendanceRow from '@/components/StudentAttendanceRow.vue'
import { useApi } from '@/composables/useApi'
import { useCheckinRules } from '@/composables/useCheckinRules'
import { useSessionDate } from '@/composables/useSessionDate'
import type { AttendanceStatus, Checkin, Session, Student } from '@/types'

const route = useRoute()
const router = useRouter()
const api = useApi()
const { formatSessionDateTime } = useSessionDate()
const { canCheckinNow } = useCheckinRules()

const session = ref<Session | null>(null)
const checkin = ref<Checkin | null>(null)
const students = ref<Student[]>([])
const loading = ref(false)
const checkinLoading = ref(false)
const totalStudentsLoading = ref(false)
const totalStudentsInput = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
const attendanceLoadingIds = ref(new Set<number>())

const sessionId = computed(() => String(route.params.id))

const sessionDetails = computed(() => {
  if (!session.value) return []

  return [
    { label: 'Status', value: session.value.session_state ?? 'Unknown' },
    { label: 'Class code', value: session.value.class_code },
    { label: 'Chapter', value: session.value.session_chapter },
    { label: 'Students', value: String(session.value.total_students) },
    { label: 'Type', value: session.value.session_type },
    { label: 'Date and time', value: formatSessionDateTime(session.value.datetime) },
  ]
})

const studentCountText = computed(() => {
  const count = students.value.length

  return `${count} ${count === 1 ? 'student' : 'students'}`
})

const canUpdateTotalStudents = computed(() => {
  return (
    Boolean(session.value) &&
    Number.isInteger(totalStudentsInput.value) &&
    totalStudentsInput.value >= 0 &&
    totalStudentsInput.value !== session.value?.total_students &&
    !totalStudentsLoading.value
  )
})

const canCheckin = computed(() => {
  return canCheckinNow(checkin.value, session.value?.datetime ?? null) && !checkinLoading.value
})

const isAttendanceLoading = (studentId: number) => attendanceLoadingIds.value.has(studentId)

const setAttendanceLoading = (studentId: number, value: boolean) => {
  const next = new Set(attendanceLoadingIds.value)

  if (value) {
    next.add(studentId)
  } else {
    next.delete(studentId)
  }

  attendanceLoadingIds.value = next
}

const loadSessionDetail = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [sessionResult, checkinResult, studentsResult] = await Promise.all([
      api.getSession(sessionId.value),
      api.getCheckin(sessionId.value),
      api.getStudents(sessionId.value),
    ])

    session.value = sessionResult
    totalStudentsInput.value = sessionResult?.total_students ?? 0
    checkin.value = checkinResult
    students.value = studentsResult
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load session details.'
  } finally {
    loading.value = false
  }
}

const handleCheckin = async () => {
  if (!canCheckin.value) return

  checkinLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    checkin.value = await api.createCheckin(sessionId.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not check in.'
  } finally {
    checkinLoading.value = false
  }
}

const markStudentAttendance = async (student: Student, status: AttendanceStatus) => {
  if (isAttendanceLoading(student.student_id)) return

  setAttendanceLoading(student.student_id, true)
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.markAttendance(sessionId.value, student.student_id, status)
    students.value = students.value.map((item) =>
      item.student_id === student.student_id ? { ...item, attendance_status: status } : item,
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not update attendance.'
  } finally {
    setAttendanceLoading(student.student_id, false)
  }
}

const updateTotalStudents = async () => {
  if (!session.value || !canUpdateTotalStudents.value) return

  totalStudentsLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updatedSession = await api.updateTotalStudents(sessionId.value, totalStudentsInput.value)

    session.value = {
      ...session.value,
      ...(updatedSession ?? {}),
      total_students: updatedSession?.total_students ?? totalStudentsInput.value,
    }
    successMessage.value = 'Total students updated.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not update total students.'
  } finally {
    totalStudentsLoading.value = false
  }
}

const goBack = () => {
  router.back()
}

const handleLogout = () => {
  api.clearStoredToken()
  router.replace('/login')
}

onMounted(loadSessionDetail)
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          class="inline-flex items-center rounded-md px-0 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          @click="goBack"
        >
          Back to dashboard
        </button>

        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>

      <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
      </p>

      <p v-if="successMessage" class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ successMessage }}
      </p>

      <div v-if="loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading session details...
      </div>

      <template v-else-if="session">
        <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Session details</p>
              <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {{ session.class_name }}
              </h1>
            </div>

            <CheckinButton
              :checkin="checkin"
              :session-datetime="session.datetime"
              :loading="checkinLoading"
              @checkin="handleCheckin"
            />
          </div>

          <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="item in sessionDetails" :key="item.label" class="rounded-md bg-slate-50 p-3">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ item.label }}</dt>
              <dd class="mt-1 text-sm font-semibold text-slate-900">{{ item.value }}</dd>
            </div>
          </dl>

          <form
            class="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end"
            @submit.prevent="updateTotalStudents"
          >
            <label class="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
              Total students
              <input
                v-model.number="totalStudentsInput"
                type="number"
                min="0"
                step="1"
                class="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                :disabled="totalStudentsLoading"
              />
            </label>

            <button
              type="submit"
              :disabled="!canUpdateTotalStudents"
              class="h-10 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {{ totalStudentsLoading ? 'Saving...' : 'Save total' }}
            </button>
          </form>
        </section>

        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Attendance</p>
              <h2 class="text-xl font-bold tracking-tight text-slate-950">{{ studentCountText }}</h2>
            </div>
          </div>

          <StudentAttendanceRow
            v-for="student in students"
            :key="student.student_id"
            :student="student"
            :loading="isAttendanceLoading(student.student_id)"
            @mark="markStudentAttendance"
          />
        </section>

        <EvaluationForm :session-id="sessionId" :students="students" />
      </template>

      <div v-else class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Session not found.
      </div>
    </div>
  </main>
</template>
