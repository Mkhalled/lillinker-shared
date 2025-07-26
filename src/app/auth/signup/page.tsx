'use client';

import Link from 'next/link';
import { useState, ChangeEvent, FormEvent } from 'react';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Button } from '@/components/ui/button/Button';
import { RoleEnum } from '@/constants/Role.enum';

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  companyName?: string;
  siret?: string;
  type?: string;
  username: string;
}

const SignupForm: React.FC = () => {
  const [role, setRole] = useState<RoleEnum>(RoleEnum.CONSULTANT);
  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    siret: '',
    type: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormData(prev => ({ ...prev, username: prev.email.split('@')[0] }));
  };

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value as RoleEnum);
  };

  const handleSubmit = (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const data = {
      ...formData,
      role,
    };
    fetch('/api/auth/register-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to register user');
        }
        return response.json();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Créer un compte</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center space-x-6 mb-6">
            <Label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value={RoleEnum.CONSULTANT}
                checked={role === RoleEnum.CONSULTANT}
                onChange={handleRoleChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Freelance</span>
            </Label>
            <Label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value={RoleEnum.COMPANY_ADMIN}
                checked={role === RoleEnum.COMPANY_ADMIN}
                onChange={handleRoleChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Entreprise</span>
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Prénom</Label>
              <Input
                type="text"
                name="firstname"
                defaultValue={formData.firstname}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Nom</Label>
              <Input
                type="text"
                name="lastname"
                defaultValue={formData.lastname}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Email</Label>
              <Input
                type="email"
                name="email"
                defaultValue={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</Label>
              <Input
                type="tel"
                name="phone"
                defaultValue={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className={role === 'COMPANY_ADMIN' ? '' : 'md:col-span-2'}>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</Label>
              <Input
                type="password"
                name="password"
                defaultValue={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {role === 'COMPANY_ADMIN' && (
              <>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;entreprise
                  </Label>
                  <Input
                    type="text"
                    name="companyName"
                    defaultValue={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">SIRET</Label>
                  <Input
                    type="text"
                    name="siret"
                    defaultValue={formData.siret}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d&apos;entreprise
                  </Label>
                  <Input
                    type="text"
                    name="type"
                    defaultValue={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <Button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-6">
            {loading ? 'Connexion...' : 'Sign Up'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default SignupForm;
