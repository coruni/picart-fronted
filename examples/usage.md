# 基础工具使用示例

本文档展示了如何使用项目中封装的基础工具和模块。

## HTTP 客户端

### 基础用法

```typescript
import { http } from '~/utils/http'

// GET 请求
const response = await http.get('/api/users', { page: 1, limit: 10 })

// POST 请求
const user = await http.post('/api/users', {
  name: '张三',
  email: 'zhangsan@example.com'
})

// PUT 请求
const updatedUser = await http.put('/api/users/1', {
  name: '李四'
})

// DELETE 请求
await http.delete('/api/users/1')

// 文件上传
const file = new File(['content'], 'test.txt', { type: 'text/plain' })
const uploadResult = await http.upload('/api/upload', file, {
  category: 'documents'
})
```

### 在组件中使用

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="user in users" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHttp } from '~/composables/useHttp'

const { loading, error, data: users, get } = useHttp()

// 获取用户列表
await get('/api/users')
</script>
```

## 本地存储

### 基础用法

```typescript
import { storage, setLocal, getLocal } from '~/utils/storage'

// 设置存储
setLocal('user', { name: '张三', age: 25 })

// 获取存储
const user = getLocal('user')

// 设置带过期时间的存储（5分钟）
setLocal('temp_data', 'some data', 5 * 60 * 1000)

// 使用类实例
storage.set('key', 'value')
const value = storage.get('key')
```

### 在组件中使用

```vue
<script setup lang="ts">
import { useLocalStorage } from '~/composables/useStorage'

// 响应式本地存储
const [theme, setTheme] = useLocalStorage('theme', 'light')

// 修改主题
const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>
```

## 数据验证

### 基础用法

```typescript
import { validate, validationRules, FormValidator } from '~/utils/validation'

// 简单验证
const isValidEmail = validate.email('test@example.com') // true
const isValidPhone = validate.phone('13800138000') // true

// 表单验证
const validator = new FormValidator()
validator.setRules({
  email: [validationRules.required(), validationRules.email()],
  phone: [validationRules.required(), validationRules.phone()],
  password: [validationRules.required(), validationRules.password()]
})

validator.setData({
  email: 'test@example.com',
  phone: '13800138000',
  password: 'Password123'
})

const result = validator.validate()
if (result.valid) {
  console.log('验证通过')
} else {
  console.log('验证失败:', result.errors)
}
```

## 通用工具函数

### 防抖和节流

```typescript
import { debounce, throttle } from '~/utils/common'

// 防抖
const debouncedSearch = debounce((query: string) => {
  console.log('搜索:', query)
}, 300)

// 节流
const throttledScroll = throttle(() => {
  console.log('滚动事件')
}, 100)
```

### 数组操作

```typescript
import { uniqueArray, groupBy, sortBy } from '~/utils/common'

const users = [
  { id: 1, name: '张三', age: 25, department: '技术部' },
  { id: 2, name: '李四', age: 30, department: '销售部' },
  { id: 3, name: '王五', age: 25, department: '技术部' }
]

// 数组去重
const uniqueUsers = uniqueArray(users, 'age')

// 数组分组
const groupedUsers = groupBy(users, 'department')

// 数组排序
const sortedUsers = sortBy(users, 'age', 'desc')
```

### 对象操作

```typescript
import { pickKeys, omitKeys, deepClone } from '~/utils/common'

const user = {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  password: '123456',
  createdAt: '2023-01-01'
}

// 选择指定字段
const publicUser = pickKeys(user, ['id', 'name', 'email'])

// 排除指定字段
const userWithoutPassword = omitKeys(user, ['password'])

// 深拷贝
const clonedUser = deepClone(user)
```

## 日期处理

### 基础用法

```typescript
import { formatDate, getRelativeTime, addTime } from '~/utils/date'

// 格式化日期
const formatted = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 相对时间
const relative = getRelativeTime(new Date(Date.now() - 3600000)) // "1小时前"

// 添加时间
const tomorrow = addTime(new Date(), 1, 'days')
```

## 格式化工具

### 基础用法

```typescript
import { formatCurrency, formatPhone, mask } from '~/utils/format'

// 格式化货币
const price = formatCurrency(12345.67) // "¥12,345.67"

// 格式化手机号
const phone = formatPhone('13800138000') // "138 0013 8000"

// 数据脱敏
const maskedPhone = mask.phone('13800138000') // "138****8000"
const maskedEmail = mask.email('test@example.com') // "tes***@example.com"
```

## 用户认证

### 在组件中使用

```vue
<template>
  <div>
    <div v-if="isAuthenticated">
      欢迎，{{ user?.name }}！
      <button @click="logout">退出登录</button>
    </div>
    <div v-else>
      <button @click="showLogin">登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, user, login, logout } = useAuth()

const showLogin = async () => {
  try {
    await login({
      username: 'admin',
      password: 'password'
    })
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>
```

## 类型定义

所有工具函数都有完整的TypeScript类型定义，可以获得良好的IDE支持：

```typescript
import type { User, ApiResponse, ValidationRule } from '~/types'

// 使用类型
const user: User = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  status: 'active'
}
```

## 全局访问

通过插件系统，可以在任何地方访问这些工具：

```vue
<script setup lang="ts">
// 通过插件注入的方式访问
const { $http, $storage, $utils } = useNuxtApp()

// 使用工具
const users = await $http.get('/api/users')
$storage.set('users', users)
const formattedDate = $utils.date.formatDate(new Date())
</script>
``` 