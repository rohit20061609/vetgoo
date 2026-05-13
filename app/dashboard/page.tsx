'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: session } = useSession();

  const { data: pets } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const res = await fetch('/api/pets');
      return res.json();
    },
  });

  const stats = [
    { label: 'Total Pets', value: pets?.length || 0, icon: '🐕' },
    { label: 'Upcoming Appointments', value: 0, icon: '📅' },
    { label: 'Active Medications', value: 0, icon: '💊' },
    { label: 'Vaccinations Due', value: 0, icon: '💉' },
  ];

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Here&apos;s an overview of your pet&apos;s health and upcoming appointments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/pets/new">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                + Add New Pet
              </Button>
            </Link>
            <Link href="/dashboard/appointments/new">
              <Button variant="outline" className="w-full">
                📅 Schedule Appointment
              </Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button variant="outline" className="w-full">
                🤖 Chat with AI Vet
              </Button>
            </Link>
            <Link href="/dashboard/medical">
              <Button variant="outline" className="w-full">
                📋 View Records
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Pets */}
        {pets && pets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Pets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet: any) => (
                <Link
                  key={pet.id}
                  href={`/dashboard/pets/${pet.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl">
                      🐕
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{pet.name}</h4>
                      <p className="text-sm text-gray-500">{pet.type} • {pet.breed}</p>
                      {pet.age && (
                        <p className="text-xs text-gray-400">Age: {pet.age} years</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {(!pets || pets.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center"
          >
            <div className="text-5xl mb-4">🐾</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No pets yet</h3>
            <p className="text-gray-600 mb-4">
              Add your first pet to get started with tracking their health!
            </p>
            <Link href="/dashboard/pets/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add Your First Pet
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
