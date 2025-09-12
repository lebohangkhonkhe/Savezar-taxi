import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { authStorage } from "@/lib/auth";

export default function Login() {
  const { toast } = useToast();
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      authStorage.setUser(data.user);
      toast({
        title: "Login successful",
        description: "Welcome to SaveZar!",
      });
      // Force page reload to trigger auth check
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFacebookLogin = () => {
    // Simulate Facebook login success
    const mockUser = {
      id: "fb-user-1",
      email: "admin@savezar.com",
      name: "SaveZar Admin"
    };
    authStorage.setUser(mockUser);
    toast({
      title: "Facebook login successful",
      description: "Welcome to SaveZar!",
    });
    window.location.reload();
  };

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen red-gradient">
      <div className="phone-container">
        <div className="status-bar">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
          <div></div>
          <div className="flex items-center space-x-1">
            <i className="fas fa-battery-full text-green-400"></i>
          </div>
        </div>

        <div className="h-full flex flex-col justify-center items-center p-8 bg-white grid-pattern">
          <div className="text-center mb-12">
            <div className="flex flex-col items-center mb-4">
              {/* Taxi dome light logo */}
              <div className="relative mb-3">
                <div className="w-16 h-12 bg-white border-4 border-gray-800 rounded-t-full relative">
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-600 rounded-full">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-800 rounded-full"></div>
                  </div>
                </div>
                <div className="w-16 h-2 bg-gray-800"></div>
              </div>
              
              {/* SaveZar text */}
              <div className="text-4xl font-bold">
                <span className="text-gray-800">save</span><span className="text-red-600">Zar</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium">mobile taxi monitor</p>
          </div>
          
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-bold text-center mb-8 text-foreground">SIGN IN</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">EMAIL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          className="w-full px-4 py-3 bg-muted border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">PASSWORD</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          className="w-full px-4 py-3 bg-muted border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center mb-6">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    data-testid="checkbox-remember"
                  />
                  <label className="ml-2 text-sm text-foreground">REMEMBER ME</label>
                </div>
                
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-md mb-4"
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Signing in..." : "SIGN IN"}
                </Button>
              </form>
            </Form>
            
            <div className="text-center mb-6">
              <p className="text-muted-foreground">OR</p>
            </div>
            
            <Button 
              onClick={handleFacebookLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md mb-4 flex items-center justify-center"
              data-testid="button-facebook"
            >
              <i className="fab fa-facebook-f mr-2"></i>
              CONNECT WITH FACEBOOK
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              <a href="#" className="text-primary hover:underline" data-testid="link-forgot-password">
                FORGOT PASSWORD?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
