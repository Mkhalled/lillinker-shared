'use client';

import { ChevronLeftIcon, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import {Button} from '@/components/ui/button/Button';
import { EyeCloseIcon } from '@/icons';

const LoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // First validate credentials with our custom API
      const validateResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        setError(errorData.error || 'Authentication failed');
        return;
      }

      // If validation passes, proceed with NextAuth sign-in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Échec de l\'authentification. Veuillez réessayer.');
        return;
      }

      if (!result?.ok) {
        setError('Échec de l\'authentification. Veuillez réessayer.');
        return;
      }

      // Get the user's role from the session
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      const role = session.user?.role;

      // Redirect based on role
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
          // Redirect based on role
          switch (role) {
            case 'COMPANY':
              router.push('/company/admin/dashboard');
              break;
            case 'MANAGER':
              router.push('/company/manager/dashboard');
              break;
            case 'FREELANCE':
              router.push('/consultant/dashboard');
              break;
            default:
              router.push('/');
          }
        }
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Form */}
      <div className="flex flex-col w-full md:w-1/2 bg-white">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-6">
            <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Retour à l'accueil
            </Link>
        </div>
        
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-2xl dark:text-white/90">
                Se connecter
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Entrez votre email et mot de passe pour vous connecter!
              </p>
            </div>
            
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
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      name="email"
                      placeholder="info@gmail.com" 
                      type="email" 
                    />
                  </div>
                  
                  <div>
                    <Label>
                      Mot de passe <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre mot de passe"
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
                  
                  <div className="flex items-center justify-between">
                    <div></div>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Mot de passe oublié?
                    </Link>
                  </div>
                  
                  <div>
                    <Button 
                      type="submit"
                      className="w-full text-white bg-blue-600 hover:bg-blue-700" 
                      size="sm"
                      disabled={loading}
                    >
                      {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                  Vous n&apos;avez pas de compte?{" "}
                  <Link
                    href="/"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    S&apos;inscrire
                  </Link>
                </p>
              </div>
            </div>
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
            <h2 className="text-xl font-bold tracking-wider">
              LILLINKER
            </h2>
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold leading-tight">
              Bienvenue sur Lillinker!
            </h1>
            
            <p className="text-white/90 text-sm leading-relaxed">
              Connectez-vous à votre compte et prenez le contrôle de votre portage salarial. Gérez vos missions, suivez vos paiements, et développez votre activité en toute sérénité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
