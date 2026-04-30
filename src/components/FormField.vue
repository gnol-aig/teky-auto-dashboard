<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{
  id: string
  label: string
  type?: string
  disabled?: boolean
  error?: string
}>()
</script>

<template>
  <label class="block">
    <span class="text-sm font-medium text-slate-700">{{ label }}</span>
    <input
      v-model="model"
      :id="id"
      :type="type ?? 'text'"
      :name="id"
      :disabled="disabled"
      required
      class="mt-2 block h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      :class="
        error
          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
          : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
      "
    />
    <span v-if="error" class="mt-1 block text-sm text-red-600">
      {{ error }}
    </span>
  </label>
</template>
