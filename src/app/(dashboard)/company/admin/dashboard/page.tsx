'use client';

import {
  BarChart3,
  BriefcaseIcon,
  CheckCircle,
  Clock,
  FileIcon,
  LineChart,
  UserPlus,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const CompanyAdminDashboard = () => {
  const { data: session } = useSession();

  // Static dashboard data
  const dashboardStats = {
    totalResponses: 24,
    acceptedResponses: 15,
    declinedResponses: 6,
    pendingResponses: 3,
  };

  // Static recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'response',
      freelancerName: 'Sophie Martin',
      serviceName: 'Frais kilométriques',
      date: '2 hours ago',
      status: 'pending',
    },
    {
      id: 2,
      type: 'accepted',
      freelancerName: 'Thomas Dubois',
      serviceName: 'Portage Salarial',
      date: '1 day ago',
      status: 'accepted',
    },
    {
      id: 3,
      type: 'declined',
      freelancerName: 'Clara Bernard',
      serviceName: 'Mutuelle Santé',
      date: '2 days ago',
      status: 'declined',
    },
    {
      id: 4,
      type: 'response',
      freelancerName: 'Hugo Leroy',
      serviceName: 'Accompagnement Juridique',
      date: '3 days ago',
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome, {session?.user?.first_name} {session?.user?.last_name}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Here&apos;s an overview of your company&apos;s performance.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Responses Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Responses
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {dashboardStats.totalResponses}
              </h3>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Total freelance requests you&apos;ve responded to
          </p>
        </div>

        {/* Accepted Responses Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Accepted Responses
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {dashboardStats.acceptedResponses}
              </h3>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Responses accepted by freelancers
          </p>
        </div>

        {/* Declined Responses Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Declined Responses
              </p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {dashboardStats.declinedResponses}
              </h3>
            </div>
            <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Responses declined by freelancers
          </p>
        </div>

        {/* Pending Responses Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pending Responses
              </p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {dashboardStats.pendingResponses}
              </h3>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Responses awaiting freelancer decision
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
            <Link
              href="/company/admin/activity"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivities.map(activity => (
              <li
                key={activity.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                    ${
                      activity.status === 'accepted'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : activity.status === 'declined'
                          ? 'bg-rose-100 dark:bg-rose-900/30'
                          : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}
                  >
                    {activity.status === 'accepted' ? (
                      <CheckCircle className={`h-5 w-5 text-emerald-600 dark:text-emerald-400`} />
                    ) : activity.status === 'declined' ? (
                      <XCircle className={`h-5 w-5 text-rose-600 dark:text-rose-400`} />
                    ) : (
                      <Clock className={`h-5 w-5 text-amber-600 dark:text-amber-400`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.freelancerName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {activity.type === 'response'
                        ? 'Awaiting response on'
                        : activity.type === 'accepted'
                          ? 'Accepted your offer for'
                          : 'Declined your offer for'}{' '}
                      <span className="font-medium">{activity.serviceName}</span>
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {activity.date}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/company/admin/services"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-md">
                <BriefcaseIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Services</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Update your service offerings
                </p>
              </div>
            </Link>
            <Link
              href="/company/admin/freelancers"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-md">
                <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  View Freelancers
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Browse freelancer profiles
                </p>
              </div>
            </Link>
            <Link
              href="/company/admin/invoices"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md">
                <FileIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Invoices</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage billing and payments
                </p>
              </div>
            </Link>
            <Link
              href="/company/admin/reports"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-shrink-0 bg-rose-100 dark:bg-rose-900/30 p-2 rounded-md">
                <LineChart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Generate Reports
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Analytics and insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminDashboard;
