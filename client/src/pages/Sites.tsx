// client/src/pages/Sites.tsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchDevices } from '@/features/devices/devicesSlice';
import { getSites, createSite, updateSite, deleteSite } from '@/lib/api';
import { Site, Device } from '@/lib/types';
import { useLocation } from 'wouter';
import { AddSiteDialog } from '@/components/sites/AddSiteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, MapPin, Calendar } from 'lucide-react';
import { EditSiteDialog } from '@/components/sites/EditSiteDialog';

export default function Sites() {
  const dispatch = useDispatch<AppDispatch>();
  const devices = useSelector((state: RootState) => state.devices.items);
  
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const [, setLocation] = useLocation();

  useEffect(() => {
    // Load initial data with Redux-cached devices for instant rendering
    if (devices.length === 0) {
      dispatch(fetchDevices());
    }
    loadSites();
    // Background refresh every 60 seconds (don't show loading spinner)
    const interval = setInterval(backgroundRefresh, 60000);
    return () => clearInterval(interval);
  }, [dispatch, devices.length]);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const sitesResult = await getSites();
      setSites(Array.isArray(sitesResult) ? sitesResult : []);
    } catch (err: any) {
      console.error('Error loading sites:', err);
      setError(err.message || 'Failed to load sites');
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const backgroundRefresh = async () => {
    // Silent background refresh without showing loading state
    try {
      const sitesResult = await getSites();
      setSites(Array.isArray(sitesResult) ? sitesResult : []);
      dispatch(fetchDevices());
    } catch (err: any) {
      // Silently ignore errors in background refresh
      console.error('Background refresh error:', err);
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

  const handleUpdateSite = async (siteData: any) => {
    if (!editingSite) return;
    try {
      await updateSite(editingSite.id, {
        site_name: siteData.siteName,
        location: siteData.location,
        description: siteData.description,
      });
      setEditingSite(null);
      await loadSites();
    } catch (err: any) {
      console.error('Error updating site:', err);
      setError(err.message || 'Failed to update site');
    }
  };

  const handleDeleteSite = async (siteId: number) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    try {
      await deleteSite(siteId);
      await loadSites();
    } catch (err: any) {
      console.error('Error deleting site:', err);
      setError(err.message || 'Failed to delete site');
    }
  };

  const getDeviceCountForSite = (siteId: number) => {
    return devices.filter(d => d.siteId === siteId).length;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
              className="hover:shadow-lg transition-shadow flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => setLocation(`/sites/${site.id}`)}>
                    <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                      {site.siteName}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSite(site);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSite(site.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {site.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{site.location}</span>
                  </div>
                )}
                {site.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {site.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(site.createdAt)}</span>
                </div>
                <div className="pt-1">
                  <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    {getDeviceCountForSite(site.id)} Device{getDeviceCountForSite(site.id) !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingSite && (
        <EditSiteDialog
          site={editingSite}
          onUpdate={handleUpdateSite}
          onClose={() => setEditingSite(null)}
        />
      )}
    </div>
  );
}
