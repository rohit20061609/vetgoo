'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, Star, Clock, Check, X } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  animal: string;
  time: string;
  type: 'ONLINE' | 'CLINIC_VISIT' | 'FARM_VISIT';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

export default function VetDashboard() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch appointments and stats
    const fetchData = async () => {
      try {
        // Mock data for now
        setAppointments([
          {
            id: '1',
            patientName: 'Max',
            animal: 'Dog (Golden Retriever)',
            time: '10:30 AM',
            type: 'CLINIC_VISIT',
            status: 'PENDING',
          },
          {
            id: '2',
            patientName: 'Bella',
            animal: 'Cat (Persian)',
            time: '02:00 PM',
            type: 'ONLINE',
            status: 'CONFIRMED',
          },
        ]);

        setStats([
          {
            label: "Today's Appointments",
            value: 8,
            icon: <Calendar className="w-6 h-6" />,
            trend: '+2 from yesterday',
          },
          {
            label: 'Total Patients',
            value: 342,
            icon: <Users className="w-6 h-6" />,
            trend: '+24 this month',
          },
          {
            label: "This Month's Earnings",
            value: '₹24,500',
            icon: <DollarSign className="w-6 h-6" />,
            trend: '+12% increase',
          },
          {
            label: 'Average Rating',
            value: 4.8,
            icon: <Star className="w-6 h-6" />,
            trend: '128 reviews',
          },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'CONFIRMED':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'COMPLETED':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'CANCELLED':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ONLINE':
        return '📱';
      case 'CLINIC_VISIT':
        return '🏥';
      case 'FARM_VISIT':
        return '🚜';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, Dr. {session?.user?.name?.split(' ')[0]}!</h1>
        <p className="text-primary-light">Here&apos;s your clinic activity for today</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[12px] p-6 border border-border-color"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-primary">{stat.icon}</div>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{stat.value}</div>
            <p className="text-sm text-text-secondary">{stat.label}</p>
            {stat.trend && <p className="text-xs text-primary mt-2">{stat.trend}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Appointment Queue - Left 2/3 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-border-color"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Appointment Queue</h2>
            <Button size="sm" variant="outline" className="border-border-color">
              View All
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <motion.div
                  key={apt.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-[12px] border-2 ${getStatusColor(apt.status)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getTypeIcon(apt.type)}</span>
                        <h3 className="font-bold">{apt.patientName}</h3>
                      </div>
                      <p className="text-sm">{apt.animal}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </p>
                      <span className="text-xs font-medium">{apt.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {apt.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8"
                        >
                          <Check className="w-4 h-4 mr-1" /> Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 h-8"
                        >
                          <X className="w-4 h-4 mr-1" /> Decline
                        </Button>
                      </>
                    )}
                    {apt.status === 'CONFIRMED' && (
                      <Button size="sm" className="flex-1 bg-primary text-white h-8">
                        View Case File
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions - Right 1/3 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Earnings Card */}
          <div className="bg-primary-light rounded-[12px] p-6 border border-primary">
            <h3 className="font-bold text-text-primary mb-4">Pending Payouts</h3>
            <div className="mb-4">
              <p className="text-4xl font-bold text-primary">₹8,750</p>
              <p className="text-sm text-text-secondary">Ready to withdraw</p>
            </div>
            <Button className="w-full bg-primary hover:bg-primary-dark text-white">
              Withdraw to Bank
            </Button>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full border-border-color justify-start">
              📋 Write Prescription
            </Button>
            <Button variant="outline" className="w-full border-border-color justify-start">
              📅 Manage Slots
            </Button>
            <Button variant="outline" className="w-full border-border-color justify-start">
              ⭐ View Reviews
            </Button>
            <Button variant="outline" className="w-full border-border-color justify-start">
              ⚙️ Settings
            </Button>
          </div>

          {/* Rating */}
          <div className="bg-yellow-50 rounded-[12px] p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-bold text-yellow-900">4.8 / 5.0</span>
            </div>
            <p className="text-sm text-yellow-800">Based on 128 reviews</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
