
import React from "react";
import Logo from "./Logo";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row auth-gradient">
      {/* Left side - Brand */}
      <div className="lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 bg-primary text-white hidden lg:flex">
        <div className="max-w-md mx-auto space-y-6">
          <Logo variant="white" size="lg" />
          <h1 className="text-4xl font-bold">
            Supercharge your workflow
          </h1>
          <p className="text-lg text-white/70">
            SaasFlow helps teams move faster with streamlined workflows, real-time collaboration, and actionable insights.
          </p>
          <div className="pt-6">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />
              ))}
              <div className="h-1.5 w-12 rounded-full bg-white" />
              {[5, 6].map((i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />
              ))}
            </div>
            <div className="mt-10">
              <p className="text-white/70 text-sm">
                "SaasFlow transformed the way our team collaborates. We've seen a 35% increase in productivity since adopting the platform."
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  JD
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold">Jane Doe</p>
                  <p className="text-xs text-white/70">Product Manager, Acme Inc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="lg:w-1/2 flex flex-col justify-center p-6 md:p-12">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

// force update
