'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Map, Clock, Award, Smartphone, Shield } from 'lucide-react';

export default function Home() {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      redirect('/dashboard');
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-light to-indigo-100">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border-color shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="font-bold text-xl text-text-primary">VetGo</span>
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <a href="#features" className="text-text-secondary hover:text-text-primary transition">Features</a>
              <a href="#how-it-works" className="text-text-secondary hover:text-text-primary transition">How It Works</a>
              <a href="#roles" className="text-text-secondary hover:text-text-primary transition">For Everyone</a>
            </div>
            <div className="flex gap-4">
              <Link href="/auth/signin">
                <Button variant="outline" className="border-border-color text-text-primary">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary-dark text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Expert Vet Care,<br />
            <span className="text-primary">Wherever You Are</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            AI-powered veterinary triage for pet parents, farmers, and dairy owners across India. Get an instant diagnosis, find the nearest vet, and book in minutes.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white h-12 px-8 text-base">
                Start Free Triage <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-border-color text-text-primary h-12 px-8 text-base">
                Find Vets Near Me
              </Button>
            </Link>
          </div>
          <div className="flex gap-6 mt-12 pt-8 border-t border-border-color">
            <div>
              <div className="text-2xl font-bold text-primary">10,000+</div>
              <div className="text-text-secondary">Animals Helped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-text-secondary">Licensed Vets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-text-secondary">Available Always</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-accent-light rounded-2xl" />
            <div className="relative bg-white rounded-2xl p-8 shadow-lg">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="bg-primary-light rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">AI Triage Result</div>
                      <div className="text-sm text-text-secondary">Possible Allergies</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">🟡 Amber</span>
                    <span className="inline-block px-3 py-1 bg-primary-light text-primary text-sm">See vet within 48h</span>
                  </div>
                  <div className="text-sm text-text-secondary">Your pet may have seasonal allergies. Monitor closely.</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    Find nearest vet in 1 km
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    Book appointment instantly
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    Pay online & get receipt
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ROLES SECTION */}
      <section id="roles" className="bg-neutral py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Built for Everyone</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">One platform, four powerful experiences designed specifically for your needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pet Parent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-[12px] p-6 border border-border-color hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🐕</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Pet Parent</h3>
              <p className="text-text-secondary text-sm mb-4">Urban dog & cat owners</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex gap-2">✓ AI symptom checker 24/7</li>
                <li className="flex gap-2">✓ Vaccination reminders</li>
                <li className="flex gap-2">✓ Find & book vets instantly</li>
              </ul>
            </motion.div>

            {/* Dairy Farmer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-[12px] p-6 border border-border-color hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🐄</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Dairy Farmer</h3>
              <p className="text-text-secondary text-sm mb-4">Commercial producers</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex gap-2">✓ Herd health assessment</li>
                <li className="flex gap-2">✓ Milk yield tracker</li>
                <li className="flex gap-2">✓ Disease alerts & schemes</li>
              </ul>
            </motion.div>

            {/* Rural Farmer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-[12px] p-6 border border-border-color hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌾</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Rural Farmer</h3>
              <p className="text-text-secondary text-sm mb-4">Mixed livestock owners</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex gap-2">✓ Voice symptom input</li>
                <li className="flex gap-2">✓ Offline triage mode</li>
                <li className="flex gap-2">✓ Click-to-call emergency</li>
              </ul>
            </motion.div>

            {/* Vet Doctor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-[12px] p-6 border border-border-color hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Vet Doctor</h3>
              <p className="text-text-secondary text-sm mb-4">Licensed veterinarians</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex gap-2">✓ Appointment management</li>
                <li className="flex gap-2">✓ Digital prescriptions</li>
                <li className="flex gap-2">✓ Earnings dashboard</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-4">How VetGo Works</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">Get expert care in just 3 simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '1', title: 'Describe Symptoms', desc: 'Text, photo, or voice input', icon: '💬' },
            { num: '2', title: 'Get AI Diagnosis', desc: 'Instant severity & first aid', icon: '🔍' },
            { num: '3', title: 'Find & Book Vet', desc: 'Search map, book, pay online', icon: '✅' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {i < 2 && (
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-primary text-2xl">→</div>
              )}
              <div className="bg-white rounded-[12px] p-8 border border-border-color text-center">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  {step.icon}
                </div>
                <div className="text-sm font-bold text-primary mb-2">Step {step.num}</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                <p className="text-text-secondary">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="bg-neutral py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Powerful Features</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">Everything you need for comprehensive pet & livestock healthcare</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI Triage', desc: 'Claude AI with 20+ years of vet expertise' },
              { icon: '🗺️', title: 'Live Vet Map', desc: 'Find nearest clinic with real distance' },
              { icon: '📅', title: 'Instant Booking', desc: 'Choose slot, pay online in seconds' },
              { icon: '📋', title: 'Digital Prescriptions', desc: 'PDF access always, anywhere' },
              { icon: '💉', title: 'Vaccination Tracker', desc: 'Automated reminders per animal' },
              { icon: '📱', title: 'Offline Triage', desc: 'Basic diagnosis without internet' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white rounded-[12px] p-6 border border-border-color hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-4">Loved by Pet Parents & Farmers</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Dilip Patil',
              role: 'Dairy Farmer, Pune',
              text: '"VetGo ने मेरे हर्ड की हेल्थ को सुधारा। बहुत आसान और सस्ता।"',
              avatar: '👨‍🌾',
            },
            {
              name: 'Priya Sharma',
              role: 'Pet Parent, Bangalore',
              text: '"My dog&apos;s symptoms were diagnosed in minutes. Found a great vet near me!"',
              avatar: '👩‍💼',
            },
            {
              name: 'Dr. Rakesh Mehta',
              role: 'Veterinarian, Nagpur',
              text: '"VetGo gives me more time with patients. The AI pre-diagnosis is impressive."',
              avatar: '👨‍⚕️',
            },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-[12px] p-6 border border-border-color"
            >
              <div className="flex gap-4 mb-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-bold text-text-primary">{testimonial.name}</div>
                  <div className="text-sm text-text-secondary">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-text-secondary italic">"{testimonial.text}"</p>
              <div className="flex gap-1 mt-4">⭐⭐⭐⭐⭐</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Pet Care?</h2>
          <p className="text-xl text-primary-light mb-8">Join 10,000+ happy pet parents and farmers across India</p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white hover:bg-neutral text-primary h-12 px-8 text-base">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-text-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="font-bold">V</span>
                </div>
                <span className="font-bold text-lg">VetGo</span>
              </div>
              <p className="text-sm text-gray-300">Expert vet care, wherever you are.</p>
            </div>
            <div>
              <div className="font-bold mb-4">Product</div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-4">Company</div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-4">For Vets</div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Join</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-300">© 2024 VetGo. All rights reserved. Made in India 🇮🇳</p>
            <p className="text-sm text-gray-300 mt-4 md:mt-0">DPDP Compliant • ISO 27001 Certified</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
