import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  // Дополнительные настройки ESLint
  features: {
    // Включить проверку стилистики
    stylistic: true,
  },
}).append({
  rules: {
    // Разрешить использование any для быстрой разработки
    '@typescript-eslint/no-explicit-any': 'warn',

    // Разрешить неиспользуемые переменные с префиксом _
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Разрешить void в типах
    '@typescript-eslint/no-invalid-void-type': 'off',

    // Предупреждение вместо ошибки для неиспользуемых переменных
    'no-unused-vars': 'warn',

    // Разрешить .apply() вместо spread оператора
    'prefer-spread': 'warn',
  },
})
