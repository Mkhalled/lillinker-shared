'use client';

import {
  BarChart3,
  CheckCircle,
  Clock,
  PlusCircle,
  StarIcon,
  XCircle,
  Construction,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { featureFlags } from '@/lib/feature-flags';

const ConsultantDashboard = () => {
  const { data: session } = useSession();

  // Check if dashboard is enabled
  if (!featureFlags.enableDashboard) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-full">
              <Construction className="h-16 w-16 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard Under Development
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We&apos;re working hard to bring you an amazing dashboard experience. This feature will
            be available soon!
          </p>
          <div className="pt-4">
            <Link
              href="/consultant/requests"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View My Requests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Static dashboard data for freelancer
  const dashboardStats = {
    totalRequests: 31,
    acceptedOffers: 18,
    declinedOffers: 7,
    pendingOffers: 6,
  };

  // Static top companies worked with
  const topCompanies = [
    { name: 'Tech Solutions', projects: 5, rating: 4.8 },
    { name: 'Digital Innovations', projects: 3, rating: 4.5 },
    { name: 'Creative Agency', projects: 2, rating: 5.0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome, {session?.user?.first_name} {session?.user?.last_name}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Here&apos;s an overview of your freelance activity.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            href="/consultant/requests/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Request
          </Link>
          <Link
            href="/consultant/profile"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            My Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Requests
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {dashboardStats.totalRequests}
              </h3>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Total service requests you&apos;ve submitted
          </p>
        </div>

        {/* Accepted Offers Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Accepted Offers
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {dashboardStats.acceptedOffers}
              </h3>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Company offers you&apos;ve accepted
          </p>
        </div>

        {/* Declined Offers Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Declined Offers
              </p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {dashboardStats.declinedOffers}
              </h3>
            </div>
            <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Company offers you&apos;ve declined
          </p>
        </div>

        {/* Pending Offers Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pending Offers
              </p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {dashboardStats.pendingOffers}
              </h3>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Offers awaiting your decision
          </p>
        </div>
      </div>

      {/* Additional Data Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Top Companies You Work With
            </h2>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {topCompanies.map((company, index) => (
              <li
                key={index}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {company.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {company.projects} projects
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                        {company.rating}
                      </span>
                    </div>
                    <Link
                      href={`/consultant/companies/${company.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Latest Request Response Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Latest Request Response Analysis
            </h2>
          </div>
          <div className="p-6">
            {/* Request Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Request #REQ-2025-092
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Portage Salarial
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Frais kilométriques
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Mutuelle Santé
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Submitted on Aug 30, 2025 •{' '}
                <span className="font-medium">16 companies received your request</span>
              </p>
            </div>

            {/* Response Stats Chart */}
            <div className="relative mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response Distribution
              </h4>

              {/* Chart Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">Accepted (31%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#f97316] mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">Pending (44%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#2563eb] mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">Counter-Offers (19%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#16a34a] mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">Declined (6%)</span>
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="relative h-48 flex justify-center items-center">
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                  {/* Define a proper circular pie chart using circle segments */}
                  {/* These calculations create proper circle segments based on percentages */}
                  {/* Green segment - 6% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="transparent"
                    stroke="#16a34a"
                    strokeWidth="50"
                    strokeDasharray="6 94"
                    strokeDashoffset="0"
                    transform="rotate(-90) translate(-100 0)"
                  />
                  {/* Blue segment - 19% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="transparent"
                    stroke="#2563eb"
                    strokeWidth="50"
                    strokeDasharray="19 81"
                    strokeDashoffset="-6"
                    transform="rotate(-90) translate(-100 0)"
                  />
                  {/* Yellow segment - 31% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="50"
                    strokeDasharray="31 69"
                    strokeDashoffset="-25"
                    transform="rotate(-90) translate(-100 0)"
                  />
                  {/* Orange segment - 44% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="50"
                    strokeDasharray="44 56"
                    strokeDashoffset="-56"
                    transform="rotate(-90) translate(-100 0)"
                  />
                </svg>
              </div>
            </div>

            {/* Response Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Responses</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">16</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Accepted</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">5</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-300">Pending</p>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">7</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">Counter-Offers</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">3</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/consultant/requests/REQ-2025-092"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
              >
                View complete request details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
