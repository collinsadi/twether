export interface StatusConfig {
  status: 'maintenance' | 'offline';
  message: string;
  githubUrl: string;
  showBanner: boolean;
}

const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE === 'true';

export const statusConfig: StatusConfig = {
  status: 'maintenance',
  message: 'Service temporarily unavailable. Check back soon!',
  githubUrl: 'https://github.com/collinsadi/twether',
  showBanner: isMaintenanceMode
};

export const statusConfigs = {
  maintenance: {
    status: 'maintenance' as const,
    message: 'Service temporarily unavailable. Check back soon!',
    githubUrl: 'https://github.com/collinsadi/twether',
    showBanner: true
  },
  hidden: {
    status: 'maintenance' as const,
    message: '',
    githubUrl: 'https://github.com/collinsadi/twether',
    showBanner: false
  }
}; 