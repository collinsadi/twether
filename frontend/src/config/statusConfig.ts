export interface StatusConfig {
  status: 'maintenance' | 'offline' | 'beta';
  message: string;
  githubUrl: string;
  showBanner: boolean;
}

// const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE === 'true';

export const statusConfig: StatusConfig = {
  status: 'beta',
  message: 'This is a beta version. Features may change and bugs may occur.',
  githubUrl: 'https://github.com/collinsadi/twether',
  showBanner: true
};

export const statusConfigs = {
  maintenance: {
    status: 'maintenance' as const,
    message: 'Service temporarily unavailable. Check back soon!',
    githubUrl: 'https://github.com/collinsadi/twether',
    showBanner: true
  },
  beta: {
    status: 'beta' as const,
    message: 'This is a beta version. Features may change and bugs may occur.',
    githubUrl: 'https://github.com/collinsadi/twether',
    showBanner: true
  },
  offline: {
    status: 'offline' as const,
    message: 'Service is currently offline. Please check back later.',
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