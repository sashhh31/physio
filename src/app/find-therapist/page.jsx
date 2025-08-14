'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  getPhysiotherapistsByLocationAndSpecialization,
  getAllAvailablePhysiotherapists
} from '@/lib/actions/physiotherapist';
import TherapistCard from '../components/TherapistCard';
import SearchBar from '../components/SearchBar';
import SkeletonCard from '../components/SkeletonCard';
import Footer from '../components/footer';

export default function FindTherapistPage() {
  const [therapists, setTherapists] = useState([]);
  const [location, setLocation] = useState('Your Area');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const observerRef = useRef(null);
  const specialization = 'Geriatric Physiotherapy';
  const limit = 10;
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchFallbackTherapists = useCallback(async (reset = false, skipCount = 0) => {
    setLoading(true);
    const result = await getAllAvailablePhysiotherapists(skipCount, limit);
    const data = result.success ? result.data : [];

    setTherapists(prev => reset ? data : [...prev, ...data]);
    setHasMore(data.length === limit);
    setUseFallback(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      if (!navigator.geolocation) {
        setLocation('Random Locations');
        await fetchFallbackTherapists(true, 0);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
            const data = await res.json();
            const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;

            if (city) {
              setLocation(city);
              const result = await getPhysiotherapistsByLocationAndSpecialization(city, specialization);
              if (result.success && result.data.length > 0) {
                setTherapists(result.data);
                setHasMore(false);
                setUseFallback(false);
              } else {
                setLocation('Random Locations');
                await fetchFallbackTherapists(true, 0);
              }
            } else {
              setLocation('Random Locations');
              await fetchFallbackTherapists(true, 0);
            }
          } catch (err) {
            console.error('Geolocation reverse lookup failed:', err);
            setLocation('Random Locations');
            await fetchFallbackTherapists(true, 0);
          } finally {
            setInitialLoad(false);
          }
        },
        async () => {
          setLocation('Random Locations');
          await fetchFallbackTherapists(true, 0);
          setInitialLoad(false);
        }
      );
    };

    loadInitial();
  }, [fetchFallbackTherapists]);

  const lastElementRef = useCallback(
    node => {
      if (loading || !hasMore || !useFallback || isSearching) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setSkip(prev => prev + limit);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, useFallback, isSearching]
  );

  useEffect(() => {
    setIsSearching(search.trim().length > 0);
  }, [search]);

  useEffect(() => {
    if (skip === 0 || !useFallback) return;
    fetchFallbackTherapists(false, skip);
  }, [skip, fetchFallbackTherapists, useFallback]);

  const filtered = therapists.filter(t =>
    [t.name, t.specialization, t.bio, t.location]
      .some(field => field?.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 50);

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-screen-xl mx-auto relative z-10">

        <SearchBar
          value={search}
          onDebouncedChange={setSearch}
          suggestions={therapists.filter((t) =>
            [t.name, t.specialization, t.bio, t.location]
              .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
          )}
          onSelectSuggestion={(t) => setSearch(t.name)}
        />

        <div className="bg-[#f9fdfc] py-20 px-6 md:px-20 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-green-500">
            Expert Care in <br />
            <span className="text-green-500">Every Specialty</span>
          </h2>
          <p className="mt-4 text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Discover our comprehensive range of physiotherapy specializations. Each treatment
            area is designed to provide targeted care for your specific needs.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
              </svg>
              Personalized Care
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zM6 20v-2c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v2" />
              </svg>
              Expert Therapists
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.45-6.3L22 9.24l-6.38-.55L12 3 8.38 8.69 2 9.24l5.27 5.46L5.82 21z" />
              </svg>
              Proven Results
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {initialLoad
            ? Array.from({ length: 8 }).map((_, idx) => <SkeletonCard key={idx} />)
            : filtered.map((t, index) =>
                index === filtered.length - 1 ? (
                  <div key={t.id} ref={lastElementRef}>
                    <TherapistCard therapist={t} />
                  </div>
                ) : (
                  <TherapistCard key={t.id} therapist={t} />
                )
              )}
        </div>

        <div className="mt-20 text-center space-y-6 animate-fade-in delay-700">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#7ce3b1]/30 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-green-500 mb-4">
              Ready to Start Your Recovery Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Book an appointment with our certified physiotherapists and get personalized treatment plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-emerald-600 from-[#7ce3b1] to-[#6dd4a2] hover:from-[#6dd4a2] hover:to-[#5eb893] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Book Appointment Now
              </button>
              <button className="border-2 border-[#7ce3b1] hover:bg-[#7ce3b1]/10 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 bg-emerald-600">
                Find Therapists
              </button>
            </div>
          </div>
        </div>

        {loading && skip > 0 && (
          <p className="text-center text-gray-500 mt-4">Loading more therapists...</p>
        )}

        {!loading && !hasMore && useFallback && (
          <p className="text-center text-gray-400 mt-4">No more therapists to show.</p>
        )}
      </div>

      <Footer />
    </section>
  );
}
