
import React from "react";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";

const Login = () => {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your credentials to access your account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
