
import React from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';
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
        <div className="flex justify-center gap-2">
          <Link to="/admin-creation">
            <Button variant="outline" size="sm">Create Super Admin</Button>
          </Link>
          <Link to="/create-super-admin">
            <Button variant="outline" size="sm">Alternative Setup</Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;

// force update
