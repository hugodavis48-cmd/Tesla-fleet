import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck, Zap } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { showToast } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    model: 'Model S Plaid',
    subject: 'Service Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your inquiry has been routed to our Senior Tesla Service Engineer!');
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', model: 'Model S Plaid', subject: 'Service Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div id="contact" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
          CONNECT WITH APEX TESLA SPECIALISTS
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Our master technicians and wrap artisans are ready to answer your technical questions, schedule emergency mobile dispatches, or review custom project specs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white">Direct Service Hubs</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Apex Fremont Technology Center</h4>
                  <p className="text-zinc-400">45500 Fremont Blvd, Cleanrooms Bay 1-6, Fremont, CA</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Apex Austin Gigafactory Hub</h4>
                  <p className="text-zinc-400">13101 Tesla Road, High-Voltage Bay 7-12, Austin, TX</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">24/7 Mobile Ranger Emergency Dispatch</h4>
                  <p className="text-zinc-400 font-mono text-xs">+1 (800) 837-5290 (Toll-Free USA / Canada)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Engineering & Crypto Settlement Desk</h4>
                  <p className="text-zinc-400 font-mono text-xs">concierge@apex-tesla.io</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-red-400 font-bold font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Operating Hours</span>
              </div>
              <p className="text-zinc-300">Mon - Sat: 07:00 AM - 09:00 PM PST</p>
              <p className="text-zinc-500">Mobile Ranger Emergency Dispatch: 24/7/365</p>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl"
          >
            <h3 className="font-heading font-bold text-lg text-white">Send Engineering Message</h3>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-heading font-bold text-lg text-white">Inquiry Received</h4>
                <p className="text-xs text-zinc-300">
                  Our service lead has received your vehicle details and will reply via email within 2 business hours.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Elena Rostova"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@domain.com"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Tesla Vehicle Model</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Model S Plaid">Model S Plaid (1,020 HP)</option>
                      <option value="Cybertruck Cyberbeast">Cybertruck Cyberbeast</option>
                      <option value="Roadster Founders">Roadster Founders Edition</option>
                      <option value="Model 3 Performance">Model 3 Performance</option>
                      <option value="Model Y Performance">Model Y Performance</option>
                      <option value="Model X Plaid">Model X Plaid Tri-Motor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Inquiry Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Service Inquiry">Maintenance & Repair Quote</option>
                      <option value="Wrap Consultation">Bespoke Vinyl Wrap & PPF</option>
                      <option value="Rental Fleet">Exotic Fleet Rental Reservation</option>
                      <option value="Staking & Yield">Vehicle & Supercharger Investment</option>
                      <option value="Crypto Settlement">Crypto Deposit & Wallet Assistance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Message & Symptoms</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your Tesla, desired wrap shade, error code, or specific delivery request..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry to Lead Engineer</span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
