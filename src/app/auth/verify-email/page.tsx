'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const SetPasswordPage = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 text-center p-4">
            <div className="w-full max-w-md">
                
                <div className="flex justify-center text-[var(--primary-color)]">
                    <Lock className="h-16 w-16" />
                </div>
                
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Définir un nouveau mot de passe
                </h1>
                
                {success ? (
                    <div className="mt-10">
                        <p className="text-lg text-gray-800">
                            Votre mot de passe a été défini et votre email vérifié avec succès !
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/auth/login"
                                className="rounded-md bg-[var(--primary-color)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-color)] transition-colors"
                            >
                                Se connecter
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="mt-4 text-base text-gray-600">
                            Veuillez saisir votre nouveau mot de passe ci-dessous.
                        </p>
                        <form className="mt-10 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] sm:text-sm"
                                    placeholder="Nouveau mot de passe"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="confirm-password" className="sr-only">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] sm:text-sm"
                                    placeholder="Confirmer le mot de passe"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 text-left">{error}</p>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-color)] transition-colors ${
                                        isLoading 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-[var(--primary-color)] hover:opacity-90 cursor-pointer'
                                    }`}
                                >
                                    {isLoading ? 'Définition du mot de passe...' : 'Mettre à jour le mot de passe'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </main>
    );
};

export default SetPasswordPage;
