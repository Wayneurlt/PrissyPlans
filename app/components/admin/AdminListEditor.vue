<script setup lang="ts">
/** Edits a string[] (e.g. "What's included") as a list of inputs. */
const model = defineModel<string[]>({ default: () => [] })
defineProps<{ id: string, placeholder?: string }>()

function add() { model.value = [...model.value, ''] }
function remove(i: number) { model.value = model.value.filter((_, idx) => idx !== i) }
function update(i: number, value: string) { model.value = model.value.map((v, idx) => (idx === i ? value : v)) }
function move(i: number, delta: number) {
  const j = i + delta
  if (j < 0 || j >= model.value.length) return
  const next = [...model.value]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  model.value = next
}
</script>

<template>
  <div :id="id" class="space-y-2">
    <div v-for="(item, i) in model" :key="i" class="flex items-center gap-2">
      <input :value="item" class="admin-input" :placeholder="placeholder" :aria-label="`Item ${i + 1}`" @input="update(i, ($event.target as HTMLInputElement).value)">
      <button type="button" class="admin-btn-secondary !px-2" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)"><AppIcon name="chevron-down" :size="16" class="rotate-180" /></button>
      <button type="button" class="admin-btn-secondary !px-2" :disabled="i === model.length - 1" aria-label="Move down" @click="move(i, 1)"><AppIcon name="chevron-down" :size="16" /></button>
      <button type="button" class="admin-btn-secondary !px-2 hover:text-danger" aria-label="Remove item" @click="remove(i)"><AppIcon name="trash" :size="16" /></button>
    </div>
    <button type="button" class="admin-btn-secondary" @click="add"><AppIcon name="plus" :size="16" /> Add item</button>
  </div>
</template>
