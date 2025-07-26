'use client';

import { ChevronLeftIcon, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Button } from '@/components/ui/button/Button';
import { EyeCloseIcon } from '@/icons';

const SetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/auth/error?error=missing-token');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      setSuccess('Votre mot de passe a été défini et votre email vérifié avec succès.');
      setTimeout(() => {
        router.push('/auth/login?message=account-ready');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Left side - Form */}
      <div className="flex flex-col w-full md:w-1/2 bg-white">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Retour à la connexion
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-2xl dark:text-white/90">
                {success ? 'Mot de passe défini!' : 'Définir votre mot de passe'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {success
                  ? 'Votre mot de passe a été défini avec succès. Vous pouvez maintenant vous connecter.'
                  : 'Créez un mot de passe sécurisé pour finaliser votre compte!'}
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                  Votre mot de passe a été défini et votre email vérifié avec succès !
                </div>

                <div>
                  <Button
                    onClick={() => router.push('/auth/login')}
                    className="w-full text-white bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Se connecter
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div>
                      <Label>
                        Nouveau mot de passe <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Entrez votre nouveau mot de passe"
                          defaultValue={formData.password}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, password: e.target.value }))
                          }
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showPassword ? (
                            <EyeIcon className="w-4 h-4 text-gray-500" />
                          ) : (
                            <EyeCloseIcon className="w-4 h-4 fill-gray-500" />
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label>
                        Confirmer le mot de passe <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirmez votre mot de passe"
                          defaultValue={formData.confirmPassword}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                          }
                        />
                        <span
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeIcon className="w-4 h-4 text-gray-500" />
                          ) : (
                            <EyeCloseIcon className="w-4 h-4 fill-gray-500" />
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Le mot de passe doit contenir au moins 8 caractères.
                    </div>

                    <div>
                      <Button
                        type="submit"
                        className="w-full text-white bg-blue-600 hover:bg-blue-700"
                        size="sm"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Définition du mot de passe...' : 'Définir le mot de passe'}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Content (hidden on mobile) */}
      <div className="hidden md:flex w-1/2 h-screen bg-[var(--primary-color)] items-center justify-center px-8">
        <div className="max-w-sm text-center text-white">
          {/* Logo with icon placeholder */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <div className="text-3xl font-bold text-white">L</div>
            </div>
            <h2 className="text-xl font-bold tracking-wider">LILLINKER</h2>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold leading-tight">
              {success ? 'Compte activé!' : 'Presque terminé!'}
            </h1>

            <p className="text-white/90 text-sm leading-relaxed">
              {success
                ? 'Votre compte Lillinker est maintenant actif. Connectez-vous pour commencer à gérer votre portage salarial en toute simplicité.'
                : 'Définissez votre mot de passe pour activer votre compte Lillinker. Une fois activé, vous pourrez gérer vos missions et suivre vos paiements facilement.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordPage;
