'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { formatDateTime } from '@/lib/utils';

export default function AppointmentsPage() {
  // TODO: Fetch appointments from API
  const appointments: any[] = [];

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Appointments</h2>
            <p className="text-gray-600">Manage your pet&apos;s veterinary appointments</p>
          </div>
          <Link href="/dashboard/appointments/new">
            <Button className="bg-blue-600 hover:bg-blue-700">+ Schedule Appointment</Button>
          </Link>
        </div>

        {appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt: any, index: number) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{apt.title}</h3>
                    <p className="text-gray-600">{apt.pet?.name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      📅 {formatDateTime(new Date(apt.scheduledFor))}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    apt.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-800'
                      : apt.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No appointments</h3>
            <p className="text-gray-600 mb-6">Schedule your first appointment</p>
            <Link href="/dashboard/appointments/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Schedule Appointment
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
