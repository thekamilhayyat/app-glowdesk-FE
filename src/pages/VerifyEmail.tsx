/**
 * Verify Email Pending Screen
 * Shown after successful signup, before email verification
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseCard, CardHeader, CardContent } from '@/components/base/BaseCard';
import { BaseButton } from '@/components/base/BaseButton';
import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/ui/Container';
import { Mail } from 'lucide-react';

const COUNTDOWN_SECONDS = 20;

export function VerifyEmail() {
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      navigate('/auth', { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, navigate]);

  const handleGoToLogin = () => {
    navigate('/auth', { replace: true });
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
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-heading font-semibold">
                Verify your email
              </h1>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-foreground">
                  We've sent a verification email to your inbox. Please verify to continue.
                </p>
                <p className="text-sm text-muted-foreground">
                  Didn't receive it? Check spam or try again later.
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Redirecting to login in <span className="font-semibold text-foreground">{secondsRemaining}s</span>
                  </p>

                  <BaseButton
                    onClick={handleGoToLogin}
                    className="w-full"
                    variant="gradient"
                  >
                    Go to Login now
                  </BaseButton>
                </div>
              </div>
            </CardContent>
          </BaseCard>
        </div>
      </Container>
    </div>
  );
}
