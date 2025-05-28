"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Role = "Freelance" | "Entreprise";

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  companyName?: string;
  siret?: string;
  type?: string;
}

export default function SignupForm() {
  const [role, setRole] = useState<Role>("Freelance");
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    siret: "",
    type: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value as Role);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Submitted data:", formData);
    // Add API call here
  };

  return (
   <div className="flex items-center justify-center min-h-screen bg-gray-100">

     <div className="w-full max-w-4xl p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Créer un compte</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center space-x-6 mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="Freelance"
              checked={role === "Freelance"}
              onChange={handleRoleChange}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Freelance</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="Entreprise"
              checked={role === "Entreprise"}
              onChange={handleRoleChange}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Entreprise</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className={role === "Entreprise" ? "" : "md:col-span-2"}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {role === "Entreprise" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                <input
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'entreprise</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-6"
        >
          S'inscrire
        </button>
      </form>
    <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
                Se connecter
            </a>
        </p>
    </div>
    </div>
   </div>
  );
}
