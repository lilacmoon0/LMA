<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'AuthRegister' })

const router = useRouter()
const auth = useAuthStore()

const submitting = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const rules: FormRules = {
  username: [{ required: true, message: 'Username is required', trigger: 'blur' }],
  email: [{ required: true, message: 'Email is required', trigger: 'blur' }],
  password: [{ required: true, message: 'Password is required', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: 'Confirm password is required', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, cb: (err?: Error) => void) => {
        if (value !== form.password) cb(new Error('Passwords do not match'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

const formRef = ref<FormInstance>()

async function onSubmit() {
  auth.clearError()
  const ok = await formRef.value?.validate?.().catch(() => false)
  if (!ok) return

  submitting.value = true
  try {
    await auth.register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      password_confirm: form.confirmPassword,
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
            <div class="auth-title">Register</div>
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
            <el-input v-model="form.password" type="password" autocomplete="new-password" show-password />
          </el-form-item>

          <el-form-item label="Confirm Password" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" autocomplete="new-password" show-password />
          </el-form-item>

          <div class="auth-actions">
            <el-button type="primary" :loading="submitting" @click="onSubmit">Create account</el-button>
            <RouterLink class="auth-link" to="/login">Back to login</RouterLink>
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

@media (max-width: 420px) {
  .auth-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .auth-actions :deep(.el-button) {
    width: 100%;
  }

  .auth-link {
    text-align: center;
  }
}

.auth-link {
  text-decoration: none;
  font-size: 14px;
}

.auth-alert {
  margin-bottom: 12px;
}
</style>
