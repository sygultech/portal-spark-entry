import React from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';

const Login = () => {
  return (
    <AuthLayout 
      title="Login to your account" 
      subtitle="Welcome back! Please enter your details."
    >
      <LoginForm />
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Admin Functions</p>
        <Link to="/admin-creation">
          <Button variant="outline" size="sm">Create Super Admin</Button>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
