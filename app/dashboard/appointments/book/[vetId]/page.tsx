'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Lock, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VetData {
  id: string;
  name: string;
  clinicName: string;
  consultFeeOnline: number;
  consultFeeVisit: number;
  specialisations: string[];
}

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const APPOINTMENT_TYPES = [
  { id: 'online', icon: '📱', label: 'Online Video Call', desc: 'Chat via video' },
  { id: 'visit', icon: '🏥', label: 'In-clinic Visit', desc: 'Visit the clinic' },
  { id: 'farm-visit', icon: '🚜', label: 'Farm/Home Visit', desc: 'Vet visits you' },
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const vetId = params.vetId as string;

  const [step, setStep] = useState(1);
  const [vet, setVet] = useState<VetData | null>(null);
  const [appointmentType, setAppointmentType] = useState('online');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [animals, setAnimals] = useState<any[]>([]);

  // Fetch vet details and animals
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vet details (simplified - in real app would fetch from API)
        setVet({
          id: vetId,
          name: 'Dr. Rajesh Mehta',
          clinicName: 'PawsPoint Clinic',
          consultFeeOnline: 299,
          consultFeeVisit: 500,
          specialisations: ['Dogs', 'Cats'],
        });

        // Fetch user's animals
        const animalsRes = await fetch('/api/animals');
        if (animalsRes.ok) {
          const data = await animalsRes.json();
          setAnimals(data.animals || []);
          if (data.animals?.length > 0) {
            setSelectedAnimal(data.animals[0].id);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [vetId]);

  // Fetch available slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch(`/api/slots?vetId=${vetId}&type=${appointmentType}`);
        if (response.ok) {
          const data = await response.json();
          setSlots(data.slots || []);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
      }
    };

    if (step === 2) {
      fetchSlots();
    }
  }, [step, appointmentType, vetId]);

  const getFee = () => {
    if (appointmentType === 'online') return vet?.consultFeeOnline || 0;
    if (appointmentType === 'visit') return vet?.consultFeeVisit || 0;
    return vet?.consultFeeVisit || 0; // Farm visit same as clinic visit
  };

  const handleNext = () => {
    if (step === 1 && !appointmentType) return;
    if (step === 2 && !selectedSlot) return;
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !selectedAnimal) return;

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vetId,
          slotId: selectedSlot.id,
          type: appointmentType,
          animalId: selectedAnimal,
          notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to payment page
        router.push(`/dashboard/appointments/payment/${data.appointmentId}`);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-primary-light to-white p-4 md:p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= 1 ? 'bg-primary' : 'bg-border-color text-text-muted'}`}>1</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border-color'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= 2 ? 'bg-primary' : 'bg-border-color text-text-muted'}`}>2</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-border-color'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= 3 ? 'bg-primary' : 'bg-border-color text-text-muted'}`}>3</div>
          </div>
          <div className="text-center text-sm text-text-secondary">
            Step {step} of 3: {step === 1 ? 'Choose Type' : step === 2 ? 'Pick Slot' : 'Review & Pay'}
          </div>
        </div>

        {/* Vet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-2">{vet?.name}</h2>
          <p className="text-text-secondary mb-4">{vet?.clinicName}</p>
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 bg-primary-light text-primary rounded-full">
              💻 ₹{vet?.consultFeeOnline}
            </span>
            <span className="px-3 py-1 bg-accent-light text-accent rounded-full">
              🏥 ₹{vet?.consultFeeVisit}
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Choose Appointment Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 mb-8"
            >
              <h3 className="text-lg font-bold text-text-primary">What type of appointment?</h3>
              <div className="grid gap-4">
                {APPOINTMENT_TYPES.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setAppointmentType(type.id)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-[12px] border-2 text-left transition ${
                      appointmentType === type.id
                        ? 'border-primary bg-primary-light'
                        : 'border-border-color bg-white hover:border-primary'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{type.icon}</span>
                      <div>
                        <h4 className="font-bold text-text-primary">{type.label}</h4>
                        <p className="text-sm text-text-secondary">{type.desc}</p>
                        <p className="text-lg font-bold text-primary mt-2">
                          ₹{type.id === 'online' ? vet?.consultFeeOnline : vet?.consultFeeVisit}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Pick Time Slot */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 mb-8"
            >
              <h3 className="text-lg font-bold text-text-primary">Pick your preferred time</h3>

              {slots.length === 0 ? (
                <div className="bg-white rounded-[12px] p-8 text-center">
                  <p className="text-text-secondary">No available slots for this date range</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {slots.map((slot) => (
                    <motion.button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      whileHover={{ scale: 1.05 }}
                      disabled={slot.isBooked}
                      className={`p-3 rounded-[12px] border-2 text-center transition ${
                        selectedSlot?.id === slot.id
                          ? 'border-primary bg-primary-light'
                          : slot.isBooked
                          ? 'border-border-color bg-stone-50 opacity-50 cursor-not-allowed'
                          : 'border-border-color bg-white hover:border-primary'
                      }`}
                    >
                      <div className="text-sm font-semibold text-text-primary">
                        {new Date(slot.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {slot.startTime}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Review & Pay */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 mb-8"
            >
              <h3 className="text-lg font-bold text-text-primary">Review your appointment</h3>

              {/* Appointment Summary */}
              <div className="bg-white rounded-[12px] p-6 space-y-4">
                <div className="border-b border-border-color pb-4">
                  <div className="text-sm text-text-secondary mb-1">Appointment Type</div>
                  <div className="font-semibold text-text-primary">
                    {APPOINTMENT_TYPES.find((t) => t.id === appointmentType)?.label}
                  </div>
                </div>

                <div className="border-b border-border-color pb-4">
                  <div className="text-sm text-text-secondary mb-1">Date & Time</div>
                  <div className="font-semibold text-text-primary">
                    {selectedSlot
                      ? `${new Date(selectedSlot.date).toLocaleDateString('en-IN')} at ${selectedSlot.startTime}`
                      : 'Not selected'}
                  </div>
                </div>

                <div className="border-b border-border-color pb-4">
                  <div className="text-sm text-text-secondary mb-1">Animal</div>
                  <select
                    value={selectedAnimal}
                    onChange={(e) => setSelectedAnimal(e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] border border-border-color focus:outline-none font-semibold"
                  >
                    <option value="">Select an animal</option>
                    {animals.map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.name} ({animal.species})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pb-4">
                  <div className="text-sm text-text-secondary mb-2">Notes (optional)</div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific concerns for the vet?"
                    rows={3}
                    className="w-full px-3 py-2 rounded-[8px] border border-border-color focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-white rounded-[12px] p-6 space-y-3">
                <div className="flex justify-between text-text-secondary">
                  <span>Consultation fee</span>
                  <span>₹{getFee()}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Platform fee</span>
                  <span>₹29</span>
                </div>
                <div className="border-t border-border-color pt-3 flex justify-between font-bold text-lg">
                  <span className="text-text-primary">Total</span>
                  <span className="text-primary">₹{getFee() + 29}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step > 1 && (
            <Button
              variant="outline"
              className="flex-1 border-border-color text-text-primary"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
          )}
          <Button
            className={`flex-1 bg-primary hover:bg-primary-dark text-white ${
              step === 3 ? 'w-full' : ''
            }`}
            onClick={step < 3 ? handleNext : handleBooking}
            disabled={
              (step === 1 && !appointmentType) ||
              (step === 2 && !selectedSlot) ||
              (step === 3 && !selectedAnimal)
            }
          >
            {step < 3 ? (
              <>
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" /> Proceed to Payment
              </>
            )}
          </Button>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-sm text-text-muted">
          <Lock className="w-4 h-4 inline mr-1" />
          Secure payment powered by Stripe
        </div>
      </div>
    </div>
  );
}
