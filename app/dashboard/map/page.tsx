'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Star, Loader, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components (they require window)
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });

interface VetData {
  id: string;
  name: string;
  clinicName: string;
  clinicAddress: string;
  latitude: number;
  longitude: number;
  specialisations: string[];
  consultFeeOnline: number;
  consultFeeVisit: number;
  isVerified: boolean;
  rating: number;
  totalRatings: number;
  bio: string | null;
  distance: number;
  availableSlots: number;
}

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Horse', 'Pig', 'Rabbit'];
const CONSULTATION_TYPES = ['online', 'visit', 'farm-visit'];

export default function VetMapPage() {
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [vets, setVets] = useState<VetData[]>([]);
  const [filteredVets, setFilteredVets] = useState<VetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState<VetData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [availableToday, setAvailableToday] = useState(false);
  const [radius, setRadius] = useState(25);
  const [maxFee, setMaxFee] = useState(2000);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Mumbai if geolocation fails
          setUserLocation({ lat: 19.0761, lng: 72.8724 });
        }
      );
    }
  }, []);

  // Fetch nearby vets
  useEffect(() => {
    if (!userLocation) return;

    const fetchVets = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lat: userLocation.lat.toString(),
          lng: userLocation.lng.toString(),
          radius: radius.toString(),
          maxFee: maxFee.toString(),
          ...(selectedSpecies && { species: selectedSpecies }),
          ...(selectedType && { type: selectedType }),
          ...(availableToday && { availableToday: 'true' }),
        });

        const response = await fetch(`/api/vets/nearby?${params}`);
        const data = await response.json();
        setVets(data.vets || []);
      } catch (error) {
        console.error('Error fetching vets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVets();
  }, [userLocation, radius, maxFee, selectedSpecies, selectedType, availableToday]);

  // Apply search filter
  useEffect(() => {
    let filtered = vets;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vet) =>
          vet.name.toLowerCase().includes(query) ||
          vet.clinicName.toLowerCase().includes(query) ||
          vet.clinicAddress.toLowerCase().includes(query)
      );
    }

    setFilteredVets(filtered);
  }, [vets, searchQuery]);

  return (
    <div className="h-full flex flex-col lg:flex-row bg-white">
      {/* Sidebar - Left panel on desktop, bottom sheet on mobile */}
      <motion.div
        className={`
          lg:w-[450px] lg:border-r lg:border-border-color flex flex-col
          fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto
          bg-white lg:bg-white rounded-t-2xl lg:rounded-none
          max-h-[80vh] lg:max-h-full overflow-hidden bottom-0 lg:bottom-auto
          ${showFilters && !showFilters ? 'block' : 'hidden'}
          lg:block
        `}
        initial={{ y: '100%' }}
        animate={{ y: showFilters ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        {/* Close button on mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 z-10"
          onClick={() => setShowFilters(false)}
        >
          <X className="w-6 h-6 text-text-primary" />
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-border-color lg:border-b-0">
            <input
              type="text"
              placeholder="Search vet or clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-[8px] border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filters */}
          <div className="p-4 space-y-4 border-b border-border-color">
            <div>
              <label className="text-sm font-semibold text-text-primary block mb-2">
                Species
              </label>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-border-color focus:outline-none"
              >
                <option value="">All species</option>
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-text-primary block mb-2">
                Consultation Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-border-color focus:outline-none"
              >
                <option value="">All types</option>
                <option value="online">Online Video</option>
                <option value="visit">In-clinic</option>
                <option value="farm-visit">Farm Visit</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-text-primary block mb-2">
                Distance: {radius} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-text-primary block mb-2">
                Max Fee: ₹{maxFee}
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={maxFee}
                onChange={(e) => setMaxFee(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={availableToday}
                onChange={(e) => setAvailableToday(e.target.checked)}
                className="w-4 h-4 rounded border-border-color"
              />
              <span className="text-sm text-text-primary">Available today only</span>
            </label>
          </div>

          {/* Vet List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredVets.length === 0 ? (
              <div className="p-8 text-center">
                <MapPin className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No vets found nearby</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredVets.map((vet) => (
                  <motion.div
                    key={vet.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedVet(vet);
                      setShowFilters(false);
                    }}
                    className={`
                      p-3 rounded-[12px] cursor-pointer transition
                      ${
                        selectedVet?.id === vet.id
                          ? 'bg-primary-light border-2 border-primary'
                          : 'bg-white border border-border-color hover:border-primary'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-text-primary text-sm">
                          {vet.name}
                        </h3>
                        <p className="text-xs text-text-secondary">{vet.clinicName}</p>
                      </div>
                      {vet.isVerified && <span className="text-xs">✓ Verified</span>}
                    </div>

                    <div className="flex items-center gap-4 mb-2 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {vet.distance} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400" /> {vet.rating.toFixed(1)} (
                        {vet.totalRatings})
                      </span>
                    </div>

                    <div className="mb-2 flex gap-1 flex-wrap text-xs">
                      {vet.specialisations.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 bg-primary-light text-primary rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-text-secondary mb-2">
                      📱 ₹{vet.consultFeeOnline} | 🏥 ₹{vet.consultFeeVisit}
                    </div>

                    {vet.availableSlots > 0 && (
                      <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
                        ✓ {vet.availableSlots} slots available
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Map - Right panel on desktop, full-screen on mobile */}
      <div className="flex-1 relative min-h-[400px] lg:min-h-full">
        {userLocation && (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* User location marker */}
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={10}
              fill
              fillColor="#E53E3E"
              color="#C53030"
              weight={2}
              opacity={0.8}
              fillOpacity={0.8}
              interactive={false}
            />

            {/* Vet markers */}
            {filteredVets.map((vet) => (
              <Marker
                key={vet.id}
                position={[vet.latitude, vet.longitude]}
                eventHandlers={{
                  click: () => {
                    setSelectedVet(vet);
                    setShowFilters(false);
                  },
                }}
              >
                <Popup>
                  <div className="w-64 p-2">
                    <h3 className="font-bold text-text-primary mb-1">{vet.name}</h3>
                    <p className="text-sm text-text-secondary mb-2">{vet.clinicName}</p>
                    <p className="text-xs text-text-secondary mb-2">{vet.clinicAddress}</p>
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <MapPin className="w-4 h-4" /> {vet.distance} km away
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400" /> {vet.rating.toFixed(1)} ({vet.totalRatings} reviews)
                    </div>
                    <div className="text-sm mb-2">
                      💰 ₹{vet.consultFeeOnline} (online) / ₹{vet.consultFeeVisit} (visit)
                    </div>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary-dark text-white">
                      Book Appointment
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {!userLocation && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Finding your location...</p>
            </div>
          </div>
        )}

        {/* Mobile filter button */}
        <Button
          className="lg:hidden fixed bottom-6 right-6 rounded-full shadow-lg bg-primary hover:bg-primary-dark"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
