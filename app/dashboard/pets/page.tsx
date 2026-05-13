'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function PetsPage() {
  const { data: pets, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const res = await fetch('/api/pets');
      if (!res.ok) throw new Error('Failed to fetch pets');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Pets</h2>
            <p className="text-gray-600">Manage your pets&apos; health and records</p>
          </div>
          <Link href="/dashboard/pets/new">
            <Button className="bg-blue-600 hover:bg-blue-700">+ Add Pet</Button>
          </Link>
        </div>

        {pets && pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet: any, index: number) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={`/dashboard/pets/${pet.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl mb-4">
                      🐕
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pet.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600" >
                      <p>
                        <strong>Type:</strong> {pet.type}
                      </p>
                      {pet.breed && (
                        <p>
                          <strong>Breed:</strong> {pet.breed}
                        </p>
                      )}
                      {pet.age && (
                        <p>
                          <strong>Age:</strong> {pet.age} years
                        </p>
                      )}
                      {pet.weight && (
                        <p>
                          <strong>Weight:</strong> {pet.weight} kg
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link href={`/dashboard/pets/${pet.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No pets yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first pet</p>
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
