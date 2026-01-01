'use client';

import { useState } from 'react';
import LoginForm from './login-form';
import SignupForm from './signup-form';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  if (isLogin) {
    return <LoginForm toggleForm={toggleForm} />;
  }

  return <SignupForm toggleForm={toggleForm} />;
}
