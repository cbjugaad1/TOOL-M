// client/src/pages/Sites.tsx
import { useEffect, useState } from 'react';
import { getSites } from '@/lib/api';
import { Site } from '@/lib/types';
import { useDispatch } from 'react-redux';
import { fetchDevices } from '@/features/devices/devicesSlice'; // if needed to fetch devices
import { useLocation } from 'wouter';

export default function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const result = await getSites();
      setSites(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sites …</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (sites.length === 0) {
    return <div className="text-center py-8">No sites found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
        <p className="text-muted-foreground">Manage your locations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sites.map(site => (
          <div 
            key={site.id} 
            className="p-4 border rounded cursor-pointer hover:bg-gray-50"
            onClick={() => setLocation(`/sites/${site.id}`)}
          >
            <h2 className="text-xl font-semibold">{site.siteName}</h2>
            <p className="text-sm text-muted-foreground">Location: {site.location ?? '–'}</p>
            <p className="text-sm text-muted-foreground">Description: {site.description ?? '–'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
