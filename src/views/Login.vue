<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'AuthLogin' })

const router = useRouter()
const auth = useAuthStore()

const submitting = ref(false)

const form = reactive({
  identifier: '',
  password: '',
})

const identifierIsEmail = computed(() => form.identifier.includes('@'))

const rules: FormRules = {
  identifier: [{ required: true, message: 'Enter username or email', trigger: 'blur' }],
  password: [{ required: true, message: 'Password is required', trigger: 'blur' }],
}

const formRef = ref<FormInstance>()

async function onSubmit() {
  auth.clearError()
  const ok = await formRef.value?.validate?.().catch(() => false)
  if (!ok) return

  submitting.value = true
  try {
    const identifier = form.identifier.trim()
    await auth.login({
      password: form.password,
      ...(identifierIsEmail.value ? { email: identifier } : { username: identifier }),
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
          <el-form-item :label="identifierIsEmail ? 'Email' : 'Username'" prop="identifier">
            <el-input
              v-model="form.identifier"
              :type="identifierIsEmail ? 'email' : 'text'"
              :autocomplete="identifierIsEmail ? 'email' : 'username'"
            />
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
