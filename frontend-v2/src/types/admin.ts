export interface ServiceStatus {
  key: string;
  name: string;
  url: string;
  port: number;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  httpStatus: number;
  error?: string;
  lastChecked: string;
  disabled?: boolean;
}

export interface EventSubscriber {
  id: number;
  userId: number;
  eventId: number;
  inscriptionDate: string;
  status: string;
  userName?: string;
  userEmail?: string;
}

export interface AdminSummary {
  totalServices: number;
  healthy: number;
  degraded: number;
  down: number;
  services: ServiceStatus[];
}

export interface AuditEntry {
  timestamp: string;
  serviceKey: string;
  method: string;
  path: string;
  status: number;
  summary: string;
}

export interface AdminEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  eventDate: string;
  totalCapacity: number;
  availableSpots: number;
  category: string;
  price: number;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  status: string;
}
