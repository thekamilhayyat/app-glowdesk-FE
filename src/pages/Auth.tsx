import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BaseCard, CardHeader, CardContent } from "@/components/base/BaseCard";
import { BaseButton } from "@/components/base/BaseButton";
import { BaseInput } from "@/components/base/BaseInput";
import { BaseLabel } from "@/components/base/BaseLabel";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { toast } from "@/components/ui/sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "admin@glowflowapp.com",
    password: "admin123",
    firstName: "",
    lastName: "",
  });

  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;
      
      if (isSignUp) {
        if (!formData.firstName || !formData.lastName) {
          toast.error("Please fill in all fields");
          return;
        }
        success = await signup(formData.email, formData.password, formData.firstName, formData.lastName);
        
        if (success) {
          toast.success("Account created successfully!");
          // Redirect to dashboard after successful signup
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000); // Wait 1 second for the toast to show
        } else {
          toast.error("User already exists with this email");
        }
      } else {
        success = await login(formData.email, formData.password);
        
        if (success) {
          toast.success("Welcome back!");
          // Redirect to dashboard after successful login
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000); // Wait 1 second for the toast to show
        } else {
          toast.error("Invalid email or password");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: isSignUp ? "admin@glowflowapp.com" : "",
      password: isSignUp ? "admin123" : "",
      firstName: "",
      lastName: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Container size="sm">
        <div className="w-full max-w-md mx-auto">
          <BaseCard variant="elevated" className="overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <Logo variant="full" size="lg" />
              </div>
              <h1 className="text-2xl font-heading font-semibold">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp 
                  ? "Sign up to get started with GlowFlowApp" 
                  : "Sign in to your account"
                }
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <BaseLabel htmlFor="firstName">First Name</BaseLabel>
                      <BaseInput
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required={isSignUp}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <BaseLabel htmlFor="lastName">Last Name</BaseLabel>
                      <BaseInput
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required={isSignUp}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <BaseLabel htmlFor="email">Email</BaseLabel>
                  <BaseInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <BaseLabel htmlFor="password">Password</BaseLabel>
                  <div className="relative">
                    <BaseInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <BaseButton
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  variant="gradient"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? "Creating Account..." : "Signing In..."}
                    </>
                  ) : (
                    isSignUp ? "Create Account" : "Sign In"
                  )}
                </BaseButton>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="ml-1 text-primary hover:text-primary-hover font-medium transition-colors"
                    disabled={isLoading}
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>

              {!isSignUp && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-2">Demo Accounts:</p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Admin:</strong> admin@glowflowapp.com / admin123</p>
                    <p><strong>Staff:</strong> emma@glowflowapp.com / emma123</p>
                    <p><strong>User:</strong> demo@glowflowapp.com / demo123</p>
                  </div>
                </div>
              )}
            </CardContent>
          </BaseCard>
        </div>
      </Container>
    </div>
  );
}