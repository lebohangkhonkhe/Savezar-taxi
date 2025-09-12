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
    <div className="min-h-screen bg-gray-900 dark:bg-black">
      <div className="phone-container">
        <div className="status-bar">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
          <div></div>
          <div></div>
        </div>

        <div className="h-full flex flex-col justify-center items-center p-6 bg-gray-100 dark:bg-gray-900">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center mb-4">
              {/* Taxi dome light logo */}
              <div className="relative mb-4">
                <div className="w-20 h-14 bg-gray-200 dark:bg-gray-700 border-4 border-gray-800 dark:border-gray-300 rounded-t-full relative">
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-800 rounded-full"></div>
                  </div>
                </div>
                <div className="w-20 h-3 bg-gray-800 dark:bg-gray-300"></div>
              </div>
              
              {/* SaveZar text */}
              <div className="text-5xl font-bold mb-2">
                <span className="text-gray-800 dark:text-gray-200">save</span><span className="text-red-600">zar</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">mobile taxi monitor</p>
          </div>
          
          {/* Form Section */}
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200 tracking-wider">SIGN IN</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">EMAIL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder=""
                          className="w-full px-4 py-4 bg-gray-300 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 dark:text-gray-100 text-base"
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
                      <FormLabel className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">PASSWORD</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder=""
                          className="w-full px-4 py-4 bg-gray-300 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 dark:text-gray-100 text-base"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center my-6">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="w-5 h-5 text-green-600 border-gray-400 dark:border-gray-600 rounded focus:ring-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    data-testid="checkbox-remember"
                  />
                  <label className="ml-3 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">REMEMBER ME</label>
                </div>
                
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-md mt-6 text-base uppercase tracking-wide"
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "SIGNING IN..." : "SIGN IN"}
                </Button>
              </form>
            </Form>
            
            {/* OR Divider */}
            <div className="text-center my-8">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 tracking-widest">OR</p>
            </div>
            
            {/* Facebook Button */}
            <Button 
              onClick={handleFacebookLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-md mb-6 flex items-center justify-center text-base uppercase tracking-wide"
              data-testid="button-facebook"
            >
              <i className="fab fa-facebook-f mr-3 text-lg"></i>
              CONNECT WITH FACEBOOK
            </Button>
            
            {/* Forgot Password Link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-bold" data-testid="link-forgot-password">
                FORGOT PASSWORD?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
