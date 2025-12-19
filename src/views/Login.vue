<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'AuthLogin' })

const router = useRouter()
const auth = useAuthStore()

const submitting = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const rules: FormRules = {
  username: [
    {
      validator: (_rule: unknown, value: string, cb: (err?: Error) => void) => {
        const hasUsername = value.trim().length > 0
        const hasEmail = form.email.trim().length > 0
        if (!hasUsername && !hasEmail) cb(new Error('Enter username or email'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
  email: [
    {
      validator: (_rule: unknown, value: string, cb: (err?: Error) => void) => {
        const hasEmail = value.trim().length > 0
        const hasUsername = form.username.trim().length > 0
        if (!hasEmail && !hasUsername) cb(new Error('Enter email or username'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: 'Password is required', trigger: 'blur' }],
}

const formRef = ref<FormInstance>()

async function onSubmit() {
  auth.clearError()
  const ok = await formRef.value?.validate?.().catch(() => false)
  if (!ok) return

  submitting.value = true
  try {
    await auth.login({
      password: form.password,
      ...(form.username.trim() ? { username: form.username.trim() } : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
    })
    await router.push('/')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div class="auth-shell">
      <el-card>
        <template #header>
          <div class="auth-header">
            <div class="auth-title">Login</div>
          </div>
        </template>

        <el-alert
          v-if="auth.error"
          type="error"
          :title="auth.error"
          show-icon
          :closable="false"
          class="auth-alert"
        />

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="Username" prop="username">
            <el-input v-model="form.username" autocomplete="username" />
          </el-form-item>

          <el-form-item label="Email" prop="email">
            <el-input v-model="form.email" autocomplete="email" />
          </el-form-item>

          <el-form-item label="Password" prop="password">
            <el-input v-model="form.password" type="password" autocomplete="current-password" show-password />
          </el-form-item>

          <div class="auth-actions">
            <el-button type="primary" :loading="submitting" @click="onSubmit">Login</el-button>
            <RouterLink class="auth-link" to="/register">Create an account</RouterLink>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  max-width: 460px;
  margin: 0 auto;
  padding-top: 24px;
}

.auth-title {
  font-weight: 700;
}

.auth-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.auth-link {
  text-decoration: none;
  font-size: 14px;
}

.auth-alert {
  margin-bottom: 12px;
}
</style>
