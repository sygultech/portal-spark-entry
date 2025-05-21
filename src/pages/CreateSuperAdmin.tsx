
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createSuperAdmin, supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";

const CreateSuperAdmin = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check if the database schema is ready
  useEffect(() => {
    const checkSetup = async () => {
      try {
        // First, test if we can connect to Supabase
        const { error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error checking auth setup:", sessionError);
          setIsSetupComplete(false);
          return;
        }
        
        // Try to query the profiles table to check if it exists and has the expected schema
        const { error: profilesError } = await supabase.from('profiles').select('role').limit(1);
        
        if (profilesError) {
          console.error("Error checking profiles table:", profilesError);
          setIsSetupComplete(false);
          return;
        }

        // Check if schools table exists
        const { error: schoolsError } = await supabase.from('schools').select('id').limit(1);
        
        if (schoolsError) {
          console.error("Error checking schools table:", schoolsError);
          setIsSetupComplete(false);
          return;
        }
        
        setIsSetupComplete(true);
      } catch (error) {
        console.error("Schema setup check error:", error);
        setIsSetupComplete(false);
      }
    };

    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Creating super admin...");
      const result = await createSuperAdmin(password);
      console.log("Result:", result);
      
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Super admin created successfully with email super@edufar.co",
        });
        setPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create super admin",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error in component:", error);
      setResult({
        success: false,
        message: error.message || "An unknown error occurred"
      });
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Super Admin</CardTitle>
          <CardDescription>
            Create the super admin account with email super@edufar.co
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  value="super@edufar.co"
                  disabled
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
          
          {isSetupComplete === false && (
            <div className="mt-4 p-3 rounded-md flex items-start gap-2 bg-amber-50 text-amber-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Database schema not ready</p>
                <p className="text-sm">The database schema might not be fully set up. Please check your Supabase console and ensure that all tables and types are created.</p>
              </div>
            </div>
          )}

          {isSetupComplete === null && (
            <div className="mt-4 p-3 rounded-md flex items-center gap-2 bg-blue-50 text-blue-800">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <div>
                <p className="text-sm">Checking database setup...</p>
              </div>
            </div>
          )}

          {result && (
            <div className={`mt-4 p-3 rounded-md flex items-start gap-2 ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {result.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{result.success ? 'Success' : 'Error'}</p>
                <p className="text-sm">{result.message}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || isSetupComplete === false || isSetupComplete === null} 
            className="w-full"
          >
            {isLoading ? "Creating..." : "Create Super Admin"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateSuperAdmin;

// force update
