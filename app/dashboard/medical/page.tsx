'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function MedicalRecordsPage() {
  // TODO: Fetch medical records from API
  const records: any[] = [];

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Medical Records</h2>
            <p className="text-gray-600">View and manage your pet&apos;s medical history</p>
          </div>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            + Add Record
          </Button>
        </div>

        {records && records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record: any, index: number) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                    <p className="text-gray-600">{record.type}</p>
                  </div>
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
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No medical records</h3>
            <p className="text-gray-600 mb-6">Start by adding your first medical record</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              + Add Record
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
