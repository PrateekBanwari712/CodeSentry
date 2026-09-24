import LoginPage_UI from '@/module/auth/components/Login_UI'
import { requireUnAuth } from '@/module/auth/utils/auth_utils'
import React from 'react'

const LoginPage = async () => {
  await requireUnAuth();
  return (
    <LoginPage_UI/>
  )
}

export default LoginPage