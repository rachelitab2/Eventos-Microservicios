import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../services/api';

interface ServiceStatusCtx {
  disabledServices: string[];
  isServiceDown: (serviceKey: string) => boolean;
  refreshStatus: () => void;
}

const ServiceStatusContext = createContext<ServiceStatusCtx>({
  disabledServices: [],
  isServiceDown: () => false,
  refreshStatus: () => {},
});

export function ServiceStatusProvider({ children }: { children: ReactNode }) {
  const [disabledServices, setDisabledServices] = useState<string[]>([]);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await api.get<{ disabledServices: string[] }>('/services/status');
      setDisabledServices(res.disabledServices || []);
    } catch {
      // Gateway itself might be down — don't break the app
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const isServiceDown = useCallback(
    (serviceKey: string) => disabledServices.includes(serviceKey),
    [disabledServices]
  );

  return (
    <ServiceStatusContext.Provider value={{ disabledServices, isServiceDown, refreshStatus }}>
      {children}
    </ServiceStatusContext.Provider>
  );
}

export function useServiceStatus() {
  return useContext(ServiceStatusContext);
}
