import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ResourceConfig {
  autoScaling: boolean;
  minInstances: number;
  maxInstances: number;
  healthCheckPath: string;
}

interface Resource {
  id: number;
  name: string;
  type: 'Server' | 'Database' | 'Load Balancer' | 'Cache' | 'External Service';
  status: 'Online' | 'Offline' | 'Error';
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  ipAddress?: string;
  region?: string;
  // External Service specific properties
  serviceUrl?: string;
  healthCheckUrl?: string;
  lastHealthCheck?: string;
  responseTime?: number; // in milliseconds
  uptime?: string;
  config?: ResourceConfig;
}

interface Application {
  id: number;
  name: string;
  status: 'Running' | 'Stopped' | 'Error';
  version: string;
  lastUpdated: string;
  description: string;
  environment: 'demo' | 'staging' | 'production';
  resources: Resource[];
  config?: {
    autoRestart: boolean;
    maxMemory: number;
    maxCpu: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    backupEnabled: boolean;
    monitoringEnabled: boolean;
  };
}

interface Tab {
  id: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-detail',
  templateUrl: './app-detail.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class AppDetailComponent implements OnInit {
  protected app: Application | null = null;
  protected appId: number = 0;
  protected activeTab: string = 'resources';
  protected isEditing: boolean = false;

  protected tabs: Tab[] = [
    { id: 'resources', label: 'Resources', active: true },
    { id: 'configure', label: 'Configure', active: false }
  ];

  private applications: Application[] = [
    {
      id: 1,
      name: 'TopHat',
      status: 'Running',
      version: '2.1.0',
      lastUpdated: '2024-01-15 10:30:00',
      description: 'Hệ thống quản lý học tập và tương tác trong lớp học',
      environment: 'production',
      resources: [
        { id: 101, name: 'Web Server 1 (Primary)', type: 'Server', status: 'Online', cpuUsage: 55, memoryUsage: 60, diskUsage: 25, ipAddress: '192.168.1.10', region: 'us-east-1', config: { autoScaling: true, minInstances: 2, maxInstances: 10, healthCheckPath: '/health' } },
        { id: 102, name: 'Web Server 2 (Replica)', type: 'Server', status: 'Online', cpuUsage: 48, memoryUsage: 58, diskUsage: 25, ipAddress: '192.168.1.12', region: 'us-east-1', config: { autoScaling: true, minInstances: 2, maxInstances: 10, healthCheckPath: '/health' } },
        { id: 103, name: 'Main Database', type: 'Database', status: 'Online', cpuUsage: 30, memoryUsage: 75, diskUsage: 40, ipAddress: '192.168.1.11', region: 'us-east-1', config: { autoScaling: false, minInstances: 1, maxInstances: 1, healthCheckPath: '/status' } },
        { id: 104, name: 'Redis Cache', type: 'Cache', status: 'Online', cpuUsage: 12, memoryUsage: 22, diskUsage: 5, ipAddress: '192.168.1.13', region: 'us-east-1', config: { autoScaling: false, minInstances: 1, maxInstances: 1, healthCheckPath: '/ping' } },
        { id: 105, name: 'Stripe Payment Gateway', type: 'External Service', status: 'Online', serviceUrl: 'https://api.stripe.com', healthCheckUrl: 'https://api.stripe.com/health', lastHealthCheck: '2024-01-15 10:30:00', responseTime: 45, uptime: '99.99%' },
        { id: 106, name: 'SendGrid Email Service', type: 'External Service', status: 'Online', serviceUrl: 'https://api.sendgrid.com', healthCheckUrl: 'https://status.sendgrid.com/api/v2/status.json', lastHealthCheck: '2024-01-15 10:29:00', responseTime: 120, uptime: '99.95%' },
      ],
      config: { autoRestart: true, maxMemory: 2048, maxCpu: 80, logLevel: 'info', backupEnabled: true, monitoringEnabled: true }
    },
    {
      id: 2,
      name: 'Teacher Zone',
      status: 'Running',
      version: '1.8.5',
      lastUpdated: '2024-01-15 09:15:00',
      description: 'Nền tảng quản lý giáo viên và tài liệu giảng dạy',
      environment: 'staging',
      resources: [
        { id: 201, name: 'Staging Server', type: 'Server', status: 'Online', cpuUsage: 28, memoryUsage: 89, diskUsage: 67, ipAddress: '10.0.0.5', region: 'eu-west-2' },
        { id: 202, name: 'MySQL Staging DB', type: 'Database', status: 'Online', cpuUsage: 45, memoryUsage: 70, diskUsage: 55, ipAddress: '10.0.0.6', region: 'eu-west-2' },
      ],
      config: { autoRestart: false, maxMemory: 1024, maxCpu: 60, logLevel: 'debug', backupEnabled: false, monitoringEnabled: true }
    },
    {
      id: 3,
      name: 'Restaurant Pro System',
      status: 'Stopped',
      version: '3.2.1',
      lastUpdated: '2024-01-14 16:45:00',
      description: 'Hệ thống quản lý nhà hàng và đặt bàn',
      environment: 'demo',
      resources: [
        { id: 301, name: 'Demo Server', type: 'Server', status: 'Offline', cpuUsage: 0, memoryUsage: 0, diskUsage: 12, ipAddress: '172.16.0.10', region: 'ap-southeast-1' }
      ],
      config: { autoRestart: true, maxMemory: 512, maxCpu: 40, logLevel: 'warn', backupEnabled: true, monitoringEnabled: false }
    },
    {
      id: 4,
      name: 'EduConnect',
      status: 'Error',
      version: '1.5.3',
      lastUpdated: '2024-01-15 11:20:00',
      description: 'Nền tảng kết nối giáo dục trực tuyến',
      environment: 'production',
      resources: [
        { id: 401, name: 'Main App Server', type: 'Server', status: 'Online', cpuUsage: 15, memoryUsage: 34, diskUsage: 89, ipAddress: '203.0.113.15', region: 'us-west-2' },
        { id: 402, name: 'Load Balancer', type: 'Load Balancer', status: 'Error', cpuUsage: 92, memoryUsage: 15, diskUsage: 2, ipAddress: '203.0.113.16', region: 'us-west-2' },
      ],
      config: { autoRestart: true, maxMemory: 4096, maxCpu: 90, logLevel: 'info', backupEnabled: true, monitoringEnabled: true }
    },
    {
      id: 5,
      name: 'Smart Inventory',
      status: 'Error',
      version: '4.0.2',
      lastUpdated: '2024-01-15 08:30:00',
      description: 'Hệ thống quản lý kho thông minh',
      environment: 'staging',
      resources: [
        { id: 501, name: 'Inventory DB', type: 'Database', status: 'Error', cpuUsage: 95, memoryUsage: 98, diskUsage: 45, ipAddress: '10.0.1.20', region: 'eu-central-1' }
      ],
      config: { autoRestart: true, maxMemory: 1536, maxCpu: 70, logLevel: 'error', backupEnabled: true, monitoringEnabled: true }
    },
    {
      id: 6,
      name: 'Customer Portal',
      status: 'Running',
      version: '2.3.1',
      lastUpdated: '2024-01-15 12:00:00',
      description: 'Cổng thông tin khách hàng và dịch vụ',
      environment: 'production',
      resources: [
        { id: 601, name: 'Portal Web Server', type: 'Server', status: 'Online', cpuUsage: 32, memoryUsage: 56, diskUsage: 18, ipAddress: '198.51.100.5', region: 'ap-northeast-1' },
      ],
      config: { autoRestart: true, maxMemory: 2048, maxCpu: 75, logLevel: 'info', backupEnabled: true, monitoringEnabled: true }
    },
    {
      id: 7,
      name: 'Analytics Dashboard',
      status: 'Running',
      version: '1.9.0',
      lastUpdated: '2024-01-15 13:15:00',
      description: 'Bảng điều khiển phân tích dữ liệu',
      environment: 'demo',
      resources: [
        { id: 701, name: 'Analytics Engine', type: 'Server', status: 'Online', cpuUsage: 18, memoryUsage: 42, diskUsage: 31, ipAddress: '172.17.0.5', region: 'sa-east-1' },
        { id: 702, name: 'ClickHouse DB', type: 'Database', status: 'Online', cpuUsage: 35, memoryUsage: 55, diskUsage: 60, ipAddress: '172.17.0.6', region: 'sa-east-1' },
      ],
      config: { autoRestart: false, maxMemory: 1024, maxCpu: 50, logLevel: 'debug', backupEnabled: false, monitoringEnabled: true }
    },
    {
      id: 8,
      name: 'Payment Gateway',
      status: 'Running',
      version: '2.7.3',
      lastUpdated: '2024-01-15 14:20:00',
      description: 'Cổng thanh toán và xử lý giao dịch',
      environment: 'production',
      resources: [
        { id: 801, name: 'API Server', type: 'Server', status: 'Online', cpuUsage: 25, memoryUsage: 78, diskUsage: 55, ipAddress: '209.10.5.100', region: 'us-east-2' },
        { id: 802, name: 'Transaction DB', type: 'Database', status: 'Online', cpuUsage: 40, memoryUsage: 85, diskUsage: 70, ipAddress: '209.10.5.101', region: 'us-east-2' },
      ],
      config: { autoRestart: true, maxMemory: 3072, maxCpu: 85, logLevel: 'warn', backupEnabled: true, monitoringEnabled: true }
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.appId = +params['id'];
      this.app = this.applications.find(app => app.id === this.appId) || null;
      
      if (!this.app) {
        this.router.navigate(['/app']);
      }
    });
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
    this.tabs.forEach(tab => {
      tab.active = tab.id === tabId;
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveConfig() {
    // Simulate saving configuration
    console.log('Saving configuration...', this.app?.config);
    this.isEditing = false;
    // Here you would typically make an API call to save the configuration
  }

  cancelEdit() {
    this.isEditing = false;
    // Reset to original values if needed
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Online': return 'status-online';
      case 'Offline': return 'status-offline';
      case 'Error': return 'status-error';
      default: return 'status-unknown';
    }
  }

  getResourceStatusClass(status: string): string {
    switch (status) {
      case 'Online':
        return 'status-running';
      case 'Offline':
        return 'status-stopped';
      case 'Error':
        return 'status-error';
      default:
        return '';
    }
  }

  getEnvironmentClass(environment: string): string {
    switch (environment) {
      case 'production':
        return 'env-production';
      case 'staging':
        return 'env-staging';
      case 'demo':
        return 'env-demo';
      default:
        return '';
    }
  }

  getUsageClass(usage: number): string {
    if (usage >= 80) return 'usage-critical';
    if (usage >= 60) return 'usage-warning';
    return 'usage-normal';
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Server': return 'type-server';
      case 'Database': return 'type-database';
      case 'Load Balancer': return 'type-loadbalancer';
      case 'Cache': return 'type-cache';
      case 'External Service': return 'type-external';
      default: return 'type-unknown';
    }
  }

  goBack() {
    this.router.navigate(['/app']);
  }
} 