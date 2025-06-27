import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PerformanceMetricComponent } from '../performance-metric/performance-metric.component';

// Interfaces (should be moved to a shared models file in a real app)
interface Resource {
  id: number;
  name: string;
  type: 'Server' | 'Database' | 'Load Balancer' | 'Cache' | 'External Service';
  status: 'Online' | 'Offline' | 'Error';
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  // External Service specific properties
  serviceUrl?: string;
  healthCheckUrl?: string;
  lastHealthCheck?: string;
  responseTime?: number;
  uptime?: string;
}

interface Application {
  id: number;
  name: string;
  status: 'Running' | 'Stopped' | 'Error';
  version: string;
  environment: 'demo' | 'staging' | 'production';
  description: string;
  resources: Resource[];
}

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  standalone: true,
  imports: [CommonModule, RouterModule, PerformanceMetricComponent]
})
export class DashboardComponent implements OnInit {
  viewMode: ViewMode = 'grid';
  protected applications: Application[] = [];
  
  // Summary stats
  protected totalApps = 0;
  protected runningApps = 0;
  protected stoppedApps = 0;
  protected errorApps = 0;
  protected totalResources = 0;

  ngOnInit() {
    this.applications = this.getMockApplications();
    this.calculateSummaryStats();
  }

  private calculateSummaryStats() {
    this.totalApps = this.applications.length;
    this.runningApps = this.applications.filter(app => app.status === 'Running').length;
    this.stoppedApps = this.applications.filter(app => app.status === 'Stopped').length;
    this.errorApps = this.applications.filter(app => app.status === 'Error').length;
    this.totalResources = this.applications.reduce((sum, app) => sum + app.resources.length, 0);
  }

  protected getAppResourceUsage(app: Application) {
    if (app.resources.length === 0) {
      return { cpu: 0, memory: 0 };
    }
    
    // Filter out external services for usage calculation
    const regularResources = app.resources.filter(res => res.type !== 'External Service');
    
    if (regularResources.length === 0) {
      return { cpu: 0, memory: 0 };
    }
    
    const totalCpu = regularResources.reduce((sum, res) => sum + (res.cpuUsage || 0), 0);
    const totalMemory = regularResources.reduce((sum, res) => sum + (res.memoryUsage || 0), 0);
    return {
      cpu: Math.round(totalCpu / regularResources.length),
      memory: Math.round(totalMemory / regularResources.length)
    };
  }

  protected getResourceBreakdown(app: Application) {
    const regularResources = app.resources.filter(res => res.type !== 'External Service');
    const externalServices = app.resources.filter(res => res.type === 'External Service');
    
    return {
      regular: regularResources.length,
      external: externalServices.length,
      total: app.resources.length
    };
  }
  
  protected getStatusClass(status: string): string {
    switch (status) {
      case 'Running': return 'status-running';
      case 'Stopped': return 'status-stopped';
      case 'Error': return 'status-error';
      default: return '';
    }
  }

  protected getEnvironmentClass(environment: string): string {
    switch (environment) {
      case 'production': return 'env-production';
      case 'staging': return 'env-staging';
      case 'demo': return 'env-demo';
      default: return '';
    }
  }

  protected getUsageClass(usage: number): string {
    if (usage >= 80) return 'usage-critical';
    if (usage >= 60) return 'usage-warning';
    return 'usage-normal';
  }

  private getMockApplications(): Application[] {
    return [
      {
        id: 1, name: 'TopHat', status: 'Running', version: '2.1.0', environment: 'production', description: 'Hệ thống quản lý học tập và tương tác trong lớp học',
        resources: [
          { id: 101, name: 'Web Server 1', type: 'Server', status: 'Online', cpuUsage: 55, memoryUsage: 60, diskUsage: 25 },
          { id: 102, name: 'Web Server 2', type: 'Server', status: 'Online', cpuUsage: 48, memoryUsage: 58, diskUsage: 25 },
          { id: 103, name: 'Main Database', type: 'Database', status: 'Online', cpuUsage: 30, memoryUsage: 75, diskUsage: 40 },
          { id: 104, name: 'Stripe Payment Gateway', type: 'External Service', status: 'Online', serviceUrl: 'https://api.stripe.com', healthCheckUrl: 'https://api.stripe.com/health', lastHealthCheck: '2024-01-15 10:30:00', responseTime: 45, uptime: '99.99%' },
          { id: 105, name: 'SendGrid Email Service', type: 'External Service', status: 'Online', serviceUrl: 'https://api.sendgrid.com', healthCheckUrl: 'https://status.sendgrid.com/api/v2/status.json', lastHealthCheck: '2024-01-15 10:29:00', responseTime: 120, uptime: '99.95%' },
        ],
      },
      {
        id: 2, name: 'Teacher Zone', status: 'Running', version: '1.8.5', environment: 'staging', description: 'Nền tảng quản lý giáo viên và tài liệu giảng dạy',
        resources: [
          { id: 201, name: 'Staging Server', type: 'Server', status: 'Online', cpuUsage: 28, memoryUsage: 89, diskUsage: 67 },
          { id: 202, name: 'MySQL Staging DB', type: 'Database', status: 'Online', cpuUsage: 45, memoryUsage: 70, diskUsage: 55 },
        ],
      },
      {
        id: 3, name: 'Restaurant Pro', status: 'Stopped', version: '3.2.1', environment: 'demo', description: 'Hệ thống quản lý nhà hàng và đặt bàn',
        resources: [ { id: 301, name: 'Demo Server', type: 'Server', status: 'Offline', cpuUsage: 0, memoryUsage: 0, diskUsage: 12 } ],
      },
      {
        id: 4, name: 'EduConnect', status: 'Error', version: '1.5.3', environment: 'production', description: 'Nền tảng kết nối giáo dục trực tuyến',
        resources: [
          { id: 401, name: 'Main App Server', type: 'Server', status: 'Online', cpuUsage: 15, memoryUsage: 34, diskUsage: 89 },
          { id: 402, name: 'Load Balancer', type: 'Load Balancer', status: 'Error', cpuUsage: 92, memoryUsage: 15, diskUsage: 2 },
        ],
      },
      {
        id: 5, name: 'Smart Inventory', status: 'Error', version: '4.0.2', environment: 'staging', description: 'Hệ thống quản lý kho thông minh',
        resources: [ { id: 501, name: 'Inventory DB', type: 'Database', status: 'Error', cpuUsage: 95, memoryUsage: 98, diskUsage: 45 } ],
      },
      {
        id: 6, name: 'Customer Portal', status: 'Running', version: '2.3.1', environment: 'production', description: 'Cổng thông tin khách hàng và dịch vụ',
        resources: [ { id: 601, name: 'Portal Web Server', type: 'Server', status: 'Online', cpuUsage: 32, memoryUsage: 56, diskUsage: 18 } ],
      },
    ];
  }

  setViewMode(mode: ViewMode) {
    this.viewMode = mode;
  }
} 