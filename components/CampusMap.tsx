import * as React from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface CampusMapProps {
  schoolName: string;
  address: string;
  lat?: number;
  lng?: number;
  lang: 'bn' | 'en';
  heightClass?: string;
}

const SchoolMarkerPin: React.FC<{
  position: { lat: number; lng: number };
  schoolName: string;
  address: string;
  lang: 'bn' | 'en';
}> = ({ position, schoolName, address, lang }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = React.useState(true);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={() => setInfoOpen((prev) => !prev)}
        title={schoolName}
      >
        <Pin background="#15803d" borderColor="#14532d" glyphColor="#facc15" scale={1.25} />
      </AdvancedMarker>
      {infoOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)} maxWidth={260}>
          <div className="p-1 text-slate-900 space-y-1">
            <p className="font-bold text-sm text-green-800">{schoolName}</p>
            <p className="text-xs text-slate-600">{address}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:underline pt-1"
            >
              <Navigation className="w-3 h-3" />
              {lang === 'bn' ? 'দিকনির্দেশনা পান' : 'Get Directions'}
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapInner: React.FC<{
  position: { lat: number; lng: number };
  schoolName: string;
  address: string;
  lang: 'bn' | 'en';
  heightClass: string;
}> = ({ position, schoolName, address, lang, heightClass }) => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className={`${heightClass} w-full rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center gap-3`}>
        <MapPin className="w-10 h-10 text-green-700 dark:text-green-400" />
        <p className="font-bold text-slate-800 dark:text-slate-100">{schoolName}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 text-white text-xs font-bold hover:bg-green-800"
        >
          <ExternalLink className="w-4 h-4" />
          {lang === 'bn' ? 'Google Maps-এ দেখুন' : 'Open in Google Maps'}
        </a>
      </div>
    );
  }

  return (
    <div className={`${heightClass} w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700`}>
      <GoogleMap
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={position}
        defaultZoom={15}
        gestureHandling="cooperative"
        style={{ width: '100%', height: '100%' }}
      >
        <SchoolMarkerPin position={position} schoolName={schoolName} address={address} lang={lang} />
      </GoogleMap>
    </div>
  );
};

export const CampusMap: React.FC<CampusMapProps> = ({
  schoolName,
  address,
  lat = 23.2248,
  lng = 91.3185,
  lang,
  heightClass = 'h-[340px]',
}) => {
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = React.useState<string>(envKey);
  const [quotaReached, setQuotaReached] = React.useState(false);

  React.useEffect(() => {
    const onQuota = () => setQuotaReached(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  React.useEffect(() => {
    if (envKey) return;
    let active = true;
    fetch('/api/config/maps')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch(() => {
        // Fallback card renders cleanly offline / standalone Capacitor
      });
    return () => {
      active = false;
    };
  }, [envKey]);

  const position = { lat, lng };

  if (!apiKey || quotaReached) {
    return (
      <div className={`${heightClass} w-full rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-emerald-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center gap-3`}>
        <div className="w-14 h-14 rounded-2xl bg-green-700 text-white flex items-center justify-center shadow-lg">
          <MapPin className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-md">
          <h4 className="font-bold text-lg text-slate-900 dark:text-white">{schoolName}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">{address}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-code">
            Lat: {lat.toFixed(4)}° N, Lng: {lng.toFixed(4)}° E
          </p>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-xs font-bold hover:bg-green-800 transition-colors shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
          {lang === 'bn' ? 'Google Maps-এ লোকেশন দেখুন' : 'View Campus on Google Maps'}
        </a>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['marker']} language={lang === 'bn' ? 'bn' : 'en'} region="BD">
      <MapInner position={position} schoolName={schoolName} address={address} lang={lang} heightClass={heightClass} />
    </APIProvider>
  );
};

export default CampusMap;
