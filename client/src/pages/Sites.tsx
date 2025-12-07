// client/src/pages/Sites.tsx
import { useEffect, useState } from 'react';
import { getSites, createSite } from '@/lib/api';
import { Site } from '@/lib/types';
import { useLocation } from 'wouter';
import { AddSiteDialog } from '@/components/sites/AddSiteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [, setLocation] = useLocation();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSites();
      setSites(Array.isArray(result) ? result : []);
    } catch (err: any) {
      console.error('Error loading sites:', err);
      setError(err.message || 'Failed to load sites');
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (siteData: any) => {
    try {
      await createSite({
        site_name: siteData.siteName,
        location: siteData.location,
        description: siteData.description,
      });
      await loadSites();
    } catch (err: any) {
      console.error('Error creating site:', err);
      setError(err.message || 'Failed to create site');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground">Manage your locations</p>
        </div>
        <AddSiteDialog onAdd={handleAddSite} />
      </div>

      {loading && <div className="text-center py-8 text-gray-500">Loading sites…</div>}
      
      {!loading && error && <div className="text-center py-8 text-red-600">{error}</div>}
      
      {!loading && !error && sites.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No sites found. Click "Add Site" to create one.
        </div>
      )}

      {!loading && !error && sites.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card
              key={site.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(`/sites/${site.id}`)}
            >
              <CardHeader>
                <CardTitle>{site.siteName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {site.location && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Location:</span> {site.location}
                  </p>
                )}
                {site.description && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Description:</span> {site.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
