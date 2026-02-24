'use client';
import { useState, useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { MapPin, Phone, Clock, Scale, Users, Gavel, Shield, PenTool, Search, LocateFixed, AlertCircle, Loader } from 'lucide-react';

const serviceTypes = [
    { key: 'all', label: 'All Services', icon: Scale },
    { key: 'policeStations', label: 'Police Stations', icon: Shield },
    { key: 'courts', label: 'Courts', icon: Gavel },
    { key: 'lawyers', label: 'Lawyers', icon: Users },
    { key: 'legalAid', label: 'Legal Aid', icon: Scale },
    { key: 'notary', label: 'Notary', icon: PenTool },
];

const serviceColorMap: Record<string, { color: string; bg: string; icon: any }> = {
    policeStations: { color: '#fca5a5', bg: 'rgba(252,165,165,0.1)', icon: Shield },
    courts: { color: '#93c5fd', bg: 'rgba(147,197,253,0.1)', icon: Gavel },
    lawyers: { color: '#C9A227', bg: 'rgba(201,162,39,0.1)', icon: Users },
    legalAid: { color: '#6ee7b7', bg: 'rgba(110,231,183,0.1)', icon: Scale },
    notary: { color: '#c4b5fd', bg: 'rgba(196,181,253,0.1)', icon: PenTool },
};

const labelMap: Record<string, string> = {
    policeStations: 'Police Station',
    courts: 'Court',
    lawyers: 'Lawyer / Advocate',
    legalAid: 'Legal Aid Center',
    notary: 'Notary Service',
};

interface ServiceItem {
    id: string;
    type: string;
    name: string;
    address: string;
    phone: string;
    hours: string;
    specialization?: string;
    lat: number;
    lng: number;
    distance: number;
}

// Distance calculation using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Reverse geocode using OpenStreetMap Nominatim API
async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const addr = data.address;
        return addr.city || addr.town || addr.county || addr.state_district || addr.state || 'Unknown Location';
    } catch {
        return 'Unknown Location';
    }
}

// Forward geocode to get coordinates from a city name
async function forwardGeocode(city: string): Promise<{ lat: number, lng: number, displayName: string } | null> {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
            headers: { 'Accept-Language': 'en' }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name.split(',')[0]
            };
        }
        return null;
    } catch {
        return null;
    }
}

// Fetch from Overpass API
async function fetchOverpassServices(lat: number, lng: number, radius = 10000): Promise<ServiceItem[]> {
    const query = `
        [out:json][timeout:25];
        (
            node["amenity"="police"](around:${radius}, ${lat}, ${lng});
            way["amenity"="police"](around:${radius}, ${lat}, ${lng});
            node["amenity"="courthouse"](around:${radius}, ${lat}, ${lng});
            way["amenity"="courthouse"](around:${radius}, ${lat}, ${lng});
            node["office"="lawyer"](around:${radius}, ${lat}, ${lng});
            way["office"="lawyer"](around:${radius}, ${lat}, ${lng});
            node["office"="notary"](around:${radius}, ${lat}, ${lng});
            way["office"="notary"](around:${radius}, ${lat}, ${lng});
            node["social_facility"="legal_aid"](around:${radius}, ${lat}, ${lng});
            way["social_facility"="legal_aid"](around:${radius}, ${lat}, ${lng});
        );
        out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
        throw new Error('Failed to fetch from Overpass API');
    }

    const data = await response.json();
    return data.elements.map((el: any) => {
        const nodeLat = el.lat || el.center?.lat;
        const nodeLng = el.lon || el.center?.lon;
        const tags = el.tags || {};

        let type = 'legalAid';
        if (tags.amenity === 'police') type = 'policeStations';
        else if (tags.amenity === 'courthouse') type = 'courts';
        else if (tags.office === 'lawyer') type = 'lawyers';
        else if (tags.office === 'notary') type = 'notary';

        const name = tags.name || tags['name:en'] || labelMap[type];
        const address = [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || tags.address || 'Address not listed';
        const phone = tags.phone || tags.contact_phone || 'Not available';
        const hours = tags.opening_hours || 'Not specified';
        const specialization = tags.specialization || undefined;

        const distance = calculateDistance(lat, lng, nodeLat, nodeLng);

        return { id: el.id.toString(), type, name, address, phone, hours, specialization, lat: nodeLat, lng: nodeLng, distance };
    });
}

export default function NearbyPage() {
    const [city, setCity] = useState('');
    const [customCity, setCustomCity] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [data, setData] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [detectedCity, setDetectedCity] = useState('');
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [searchCoords, setSearchCoords] = useState<{ lat: number; lng: number } | null>(null);

    const performSearch = async (targetLat: number, targetLng: number, cityName: string) => {
        setLoading(true);
        setError('');
        try {
            const results = await fetchOverpassServices(targetLat, targetLng);
            results.sort((a, b) => a.distance - b.distance); // Sort nearest first
            setData(results);
            setCity(cityName);
            setSearched(true);
            setSearchCoords({ lat: targetLat, lng: targetLng });
        } catch (err: any) {
            setError('Could not fetch nearby services right now. Please try again later.');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCityServices = async (searchCity: string) => {
        if (!searchCity.trim()) return;
        setLoading(true); setError('');

        try {
            // Forward geocode city name to lat/lng
            const geocoded = await forwardGeocode(searchCity);
            if (!geocoded) {
                setError(`Could not find coordinates for "${searchCity}". Please check the spelling.`);
                setLoading(false);
                return;
            }
            await performSearch(geocoded.lat, geocoded.lng, geocoded.displayName);
        } catch (err) {
            setError(`Failed to search for "${searchCity}".`);
            setLoading(false);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        setLocating(true);
        setLocationError('');
        setDetectedCity('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserCoords({ lat: latitude, lng: longitude });

                // Reverse geocode to get city name
                const foundCity = await reverseGeocode(latitude, longitude);

                if (foundCity) {
                    setDetectedCity(foundCity);
                    setCustomCity(foundCity);
                }

                await performSearch(latitude, longitude, foundCity || 'Your Location');
                setLocating(false);
            },
            (err) => {
                setLocating(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setLocationError('Location access denied. Please allow location permission in your browser settings, then try again.');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setLocationError('Location unavailable. Please type your city manually.');
                        break;
                    default:
                        setLocationError('Could not retrieve location. Please type your city manually.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Auto-try location on first load
    useEffect(() => { detectLocation(); }, []);

    const filtered = filterType === 'all' ? data : data.filter(item => item.type === filterType);

    const getMapLink = (item: ServiceItem) => {
        return `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
    };

    const getDirectionsLink = (item: ServiceItem) => {
        const dest = `${item.lat},${item.lng}`;
        const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : (searchCoords ? `${searchCoords.lat},${searchCoords.lng}` : '');
        return origin ? `https://www.google.com/maps/dir/${origin}/${dest}` : getMapLink(item);
    };

    return (
        <div style={{ paddingTop: '64px', minHeight: '100vh', padding: '84px 24px 40px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F1E8D8', marginBottom: '8px' }}>Find Legal Help Nearby</h1>
                    <p style={{ color: '#9E9689' }}>Locate police stations, courts, lawyers, legal aid, and notary services in a 10km radius.</p>
                </div>

                {/* Location card */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>

                    {/* Detect location button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <button
                            suppressHydrationWarning
                            onClick={detectLocation}
                            disabled={locating}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '12px 22px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #C9A227, #E0C56E)',
                                color: '#0E0E10', fontWeight: '700', fontSize: '0.92rem',
                                border: 'none', cursor: locating ? 'not-allowed' : 'pointer',
                                opacity: locating ? 0.8 : 1, transition: 'all 0.2s',
                                boxShadow: '0 4px 20px rgba(201,162,39,0.3)'
                            }}
                        >
                            {locating
                                ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Detecting Location...</>
                                : <><LocateFixed size={18} /> Use My Location</>
                            }
                        </button>

                        {detectedCity && !locating && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                borderRadius: '8px', background: 'rgba(110,231,183,0.1)',
                                border: '1px solid rgba(110,231,183,0.3)'
                            }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', animation: 'pulse-gold 2s infinite' }} />
                                <span style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: '600' }}>
                                    📍 Detected: {detectedCity}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Location error */}
                    {locationError && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px',
                            borderRadius: '8px', background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.25)', marginBottom: '16px'
                        }}>
                            <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span style={{ fontSize: '0.83rem', color: '#fcd34d' }}>{locationError}</span>
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                        <span style={{ fontSize: '0.72rem', color: '#9E9689', letterSpacing: '1px' }}>OR SEARCH BY CITY</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    {/* Manual city search */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            value={customCity}
                            onChange={e => setCustomCity(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchCityServices(customCity)}
                            placeholder="Type city name (e.g. Delhi, Mumbai, Pune...)"
                            className="input-field"
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <button
                            className="btn-primary"
                            onClick={() => fetchCityServices(customCity)}
                            disabled={!customCity.trim() || loading}
                            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', opacity: !customCity.trim() || loading ? 0.5 : 1 }}
                        >
                            <Search size={16} /> Search
                        </button>
                    </div>
                </div>

                {/* Service type filter */}
                {searched && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {serviceTypes.map(({ key, label, icon: Icon }) => (
                            <button key={key} onClick={() => setFilterType(key)} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
                                background: filterType === key ? 'rgba(201,162,39,0.15)' : 'transparent',
                                color: filterType === key ? '#C9A227' : '#9E9689',
                                border: filterType === key ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer', transition: 'all 0.15s'
                            }}>
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>
                )}

                {error && (
                    <div style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px', fontSize: '0.88rem', display: 'flex', gap: '8px' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                    </div>
                )}

                {/* Loading */}
                {(loading || locating) && (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="loading-spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }} />
                        <p style={{ color: '#9E9689' }}>{locating ? 'Getting your location...' : `Finding legal services in ${city || customCity}...`}</p>
                    </div>
                )}

                {/* Results */}
                {!loading && !locating && searched && (
                    <>
                        <div style={{ marginBottom: '16px', color: '#9E9689', fontSize: '0.85rem' }}>
                            Showing <strong style={{ color: '#C9A227' }}>{filtered.length}</strong> results within 10km of{' '}
                            <strong style={{ color: '#F1E8D8' }}>{city}</strong>
                            {userCoords && searchCoords && userCoords.lat === searchCoords.lat && <span style={{ color: '#34d399', marginLeft: '8px' }}>📍 (Near your location)</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {filtered.map((item) => {
                                const style = serviceColorMap[item.type] || serviceColorMap.courts;
                                const Icon = style.icon;
                                return (
                                    <div key={item.id} className="glass-card" style={{ padding: '20px', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: style.bg, border: `1px solid ${style.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Icon size={18} color={style.color} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                                    <span className="badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.color}30`, fontSize: '0.62rem', marginBottom: '4px' }}>
                                                        {labelMap[item.type]}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#D4CCBE', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                                        {item.distance < 1 ? '< 1 km' : `${item.distance.toFixed(1)} km`}
                                                    </span>
                                                </div>
                                                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#F1E8D8', lineHeight: '1.3', marginTop: '4px' }}>{item.name}</h3>
                                                {item.specialization && <p style={{ fontSize: '0.74rem', color: '#9E9689', marginTop: '2px' }}>{item.specialization}</p>}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.82rem', marginBottom: '14px', flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '8px', color: '#D4CCBE' }}>
                                                <MapPin size={13} color="#9E9689" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <span>{item.address}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <Phone size={13} color="#9E9689" style={{ flexShrink: 0, marginTop: '1px' }} />
                                                {item.phone !== 'Not available' ? (
                                                    <a href={`tel:${item.phone}`} style={{ color: '#C9A227', fontWeight: '600' }}>{item.phone}</a>
                                                ) : <span style={{ color: '#9E9689' }}>{item.phone}</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', color: '#D4CCBE' }}>
                                                <Clock size={13} color="#9E9689" style={{ flexShrink: 0, marginTop: '1px' }} />
                                                <span>{item.hours}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                            <a href={getMapLink(item)} target="_blank" rel="noopener noreferrer"
                                                className="btn-secondary"
                                                style={{ flex: 1, padding: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                <MapPin size={12} /> View Map
                                            </a>
                                            <a href={getDirectionsLink(item)} target="_blank" rel="noopener noreferrer"
                                                className="btn-primary"
                                                style={{ flex: 1, padding: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                <LocateFixed size={12} /> Directions
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {!loading && !locating && searched && filtered.length === 0 && !error && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9E9689' }}>
                        <MapPin size={40} color="#9E9689" style={{ margin: '0 auto 16px' }} />
                        <p>No services found in this 10km radius. Try another location.</p>
                    </div>
                )}

                {/* First load - not yet searched */}
                {!searched && !loading && !locating && !error && !locationError && (
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <LocateFixed size={52} color="#C9A227" style={{ margin: '0 auto 20px', opacity: 0.6 }} />
                        <h3 style={{ color: '#F1E8D8', marginBottom: '10px', fontWeight: '700' }}>Ready to Find Legal Help</h3>
                        <p style={{ color: '#9E9689', maxWidth: '400px', margin: '0 auto', lineHeight: '1.7' }}>
                            Click <strong style={{ color: '#C9A227' }}>Use My Location</strong> above to automatically find the nearest police stations, courts, and lawyers around you right now.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
