import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration } from 'chart.js/auto';

// Temporary interfaces until a shared model is created
interface ResourceConfig {
  autoScaling: boolean;
  minInstances: number;
  maxInstances: number;
  healthCheckPath: string;
}

interface RealTimeData {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
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
  logs?: string[];
}

interface Application {
  id: number;
  name: string;
  resources: Resource[];
}

interface Tab {
  id: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './resource-detail.html',
})
export class ResourceDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('realTimeChart', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  protected app: Application | null = null;
  protected resource: Resource | null = null;
  protected appId: number = 0;
  protected resourceId: number = 0;
  
  protected activeTab: string = 'dashboard';
  protected isEditing: boolean = false;
  protected realTimeData: RealTimeData[] = [];

  protected tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', active: true },
    { id: 'configure', label: 'Configure', active: false },
  ];

  private chart: Chart | null = null;
  private updateInterval: any;
  private maxDataPoints = 20;

  // Mock data - In a real app, this would come from a shared service
  private applications: Application[] = [
    {
      id: 1,
      name: 'TopHat',
      resources: [
        { id: 101, name: 'Web Server 1 (Primary)', type: 'Server', status: 'Online', cpuUsage: 55, memoryUsage: 60, diskUsage: 25, ipAddress: '192.168.1.10', region: 'us-east-1', config: { autoScaling: true, minInstances: 2, maxInstances: 10, healthCheckPath: '/health' }, logs: ['2024-07-28 10:00:00 - Request spike handled', '2024-07-28 10:05:00 - CPU usage normalized'] },
        { id: 102, name: 'Web Server 2 (Replica)', type: 'Server', status: 'Online', cpuUsage: 48, memoryUsage: 58, diskUsage: 25, ipAddress: '192.168.1.12', region: 'us-east-1', config: { autoScaling: true, minInstances: 2, maxInstances: 10, healthCheckPath: '/health' }, logs: ['2024-07-28 10:01:00 - Syncing with primary server'] },
        { id: 103, name: 'Main Database', type: 'Database', status: 'Online', cpuUsage: 30, memoryUsage: 75, diskUsage: 40, ipAddress: '192.168.1.11', region: 'us-east-1', config: { autoScaling: false, minInstances: 1, maxInstances: 1, healthCheckPath: '/status' }, logs: ['2024-07-28 09:55:00 - DB Backup successful', '2024-07-28 09:58:00 - Query optimization routine finished'] },
        { id: 104, name: 'Redis Cache', type: 'Cache', status: 'Online', cpuUsage: 12, memoryUsage: 22, diskUsage: 5, ipAddress: '192.168.1.13', region: 'us-east-1', config: { autoScaling: false, minInstances: 1, maxInstances: 1, healthCheckPath: '/ping' }, logs: ['2024-07-28 10:02:00 - Cache hit ratio at 98%'] },
        { id: 105, name: 'Stripe Payment Gateway', type: 'External Service', status: 'Online', serviceUrl: 'https://api.stripe.com', healthCheckUrl: 'https://api.stripe.com/health', lastHealthCheck: '2024-01-15 10:30:00', responseTime: 45, uptime: '99.99%', logs: ['2024-01-15 10:30:00 - Health check passed', '2024-01-15 10:25:00 - Payment processed successfully'] },
        { id: 106, name: 'SendGrid Email Service', type: 'External Service', status: 'Online', serviceUrl: 'https://api.sendgrid.com', healthCheckUrl: 'https://status.sendgrid.com/api/v2/status.json', lastHealthCheck: '2024-01-15 10:29:00', responseTime: 120, uptime: '99.95%', logs: ['2024-01-15 10:29:00 - Health check passed', '2024-01-15 10:28:00 - Email delivered successfully'] },
      ],
    },
    {
      id: 2, name: 'Teacher Zone',
      resources: [ { id: 201, name: 'Staging Server', type: 'Server', status: 'Online', cpuUsage: 28, memoryUsage: 89, diskUsage: 67, ipAddress: '10.0.0.5', region: 'eu-west-2' }, { id: 202, name: 'MySQL Staging DB', type: 'Database', status: 'Online', cpuUsage: 45, memoryUsage: 70, diskUsage: 55, ipAddress: '10.0.0.6', region: 'eu-west-2' }, ],
    },
    { id: 3, name: 'Restaurant Pro System', resources: [ { id: 301, name: 'Demo Server', type: 'Server', status: 'Offline', cpuUsage: 0, memoryUsage: 0, diskUsage: 12, ipAddress: '172.16.0.10', region: 'ap-southeast-1' } ], },
    { id: 4, name: 'EduConnect', resources: [ { id: 401, name: 'Main App Server', type: 'Server', status: 'Online', cpuUsage: 15, memoryUsage: 34, diskUsage: 89, ipAddress: '203.0.113.15', region: 'us-west-2' }, { id: 402, name: 'Load Balancer', type: 'Load Balancer', status: 'Error', cpuUsage: 92, memoryUsage: 15, diskUsage: 2, ipAddress: '203.0.113.16', region: 'us-west-2' }, ], },
    { id: 5, name: 'Smart Inventory', resources: [ { id: 501, name: 'Inventory DB', type: 'Database', status: 'Error', cpuUsage: 95, memoryUsage: 98, diskUsage: 45, ipAddress: '10.0.1.20', region: 'eu-central-1' } ], },
    { id: 6, name: 'Customer Portal', resources: [ { id: 601, name: 'Portal Web Server', type: 'Server', status: 'Online', cpuUsage: 32, memoryUsage: 56, diskUsage: 18, ipAddress: '198.51.100.5', region: 'ap-northeast-1' }, ], },
    { id: 7, name: 'Analytics Dashboard', resources: [ { id: 701, name: 'Analytics Engine', type: 'Server', status: 'Online', cpuUsage: 18, memoryUsage: 42, diskUsage: 31, ipAddress: '172.17.0.5', region: 'sa-east-1' }, { id: 702, name: 'ClickHouse DB', type: 'Database', status: 'Online', cpuUsage: 35, memoryUsage: 55, diskUsage: 60, ipAddress: '172.17.0.6', region: 'sa-east-1' }, ], },
    { id: 8, name: 'Payment Gateway', resources: [ { id: 801, name: 'API Server', type: 'Server', status: 'Online', cpuUsage: 25, memoryUsage: 78, diskUsage: 55, ipAddress: '209.10.5.100', region: 'us-east-2' }, { id: 802, name: 'Transaction DB', type: 'Database', status: 'Online', cpuUsage: 40, memoryUsage: 85, diskUsage: 70, ipAddress: '209.10.5.101', region: 'us-east-2' }, ], }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.appId = +params['appId'];
      this.resourceId = +params['resourceId'];

      this.app = this.applications.find((app) => app.id === this.appId) || null;
      if (this.app) {
        this.resource =
          this.app.resources.find((res) => res.id === this.resourceId) || null;
      }

      if (!this.resource) {
        // Redirect to the application detail page if the resource is not found
        this.router.navigate(['/app', this.appId]);
      } else {
        this.initializeRealTimeData();
      }
    });
  }

  ngAfterViewInit() {
    if (this.resource && this.resource.type !== 'External Service') {
      this.createChart();
      this.startRealTimeUpdates();
    }
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initializeRealTimeData() {
    if (!this.resource || this.resource.type === 'External Service') return;

    const now = new Date();
    for (let i = this.maxDataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 2000); // 2 seconds apart
      this.realTimeData.push({
        timestamp: time.toLocaleTimeString(),
        cpu: this.generateRandomValue(this.resource!.cpuUsage || 0, 10),
        memory: this.generateRandomValue(this.resource!.memoryUsage || 0, 8),
        disk: this.generateRandomValue(this.resource!.diskUsage || 0, 5)
      });
    }
  }

  private generateRandomValue(baseValue: number, variance: number): number {
    const min = Math.max(0, baseValue - variance);
    const max = Math.min(100, baseValue + variance);
    return Math.round(Math.random() * (max - min) + min);
  }

  private createChart() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.realTimeData.map(d => d.timestamp),
        datasets: [
          {
            label: 'CPU Usage (%)',
            data: this.realTimeData.map(d => d.cpu),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5
          },
          {
            label: 'Memory Usage (%)',
            data: this.realTimeData.map(d => d.memory),
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5
          },
          {
            label: 'Disk Usage (%)',
            data: this.realTimeData.map(d => d.disk),
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#495057',
              font: { size: 12 }
            }
          },
          title: {
            display: true,
            text: 'Real-time Resource Metrics',
            color: '#343a40',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#6c757d', maxTicksLimit: 10 },
            grid: { color: '#dee2e6' }
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#6c757d',
              callback: function(value) { return value + '%'; }
            },
            grid: { color: '#dee2e6' }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        animation: {
          duration: 300
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateRealTimeData();
    }, 2000);
  }

  private updateRealTimeData() {
    if (!this.resource || !this.chart) return;

    const now = new Date();
    const newData: RealTimeData = {
      timestamp: now.toLocaleTimeString(),
      cpu: this.generateRandomValue(this.resource.cpuUsage || 0, 10),
      memory: this.generateRandomValue(this.resource.memoryUsage || 0, 8),
      disk: this.generateRandomValue(this.resource.diskUsage || 0, 5)
    };

    this.realTimeData.push(newData);

    if (this.realTimeData.length > this.maxDataPoints) {
      this.realTimeData.shift();
    }

    this.chart.data.labels = this.realTimeData.map(d => d.timestamp);
    this.chart.data.datasets[0].data = this.realTimeData.map(d => d.cpu);
    this.chart.data.datasets[1].data = this.realTimeData.map(d => d.memory);
    this.chart.data.datasets[2].data = this.realTimeData.map(d => d.disk);

    this.chart.update('none');
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
    this.tabs.forEach((tab) => {
      tab.active = tab.id === tabId;
    });
  }
  
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveConfig() {
    console.log('Saving resource configuration...', this.resource?.config);
    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
    // Here you would reset any changes made
  }

  goBack() {
    this.router.navigate(['/app', this.appId]);
  }

  get cpuAverage(): string {
    if (this.realTimeData.length === 0) return '0.0';
    const avg = this.realTimeData.reduce((sum, d) => sum + d.cpu, 0) / this.realTimeData.length;
    return avg.toFixed(1);
  }

  get memoryAverage(): string {
    if (this.realTimeData.length === 0) return '0.0';
    const avg = this.realTimeData.reduce((sum, d) => sum + d.memory, 0) / this.realTimeData.length;
    return avg.toFixed(1);
  }

  get diskAverage(): string {
    if (this.realTimeData.length === 0) return '0.0';
    const avg = this.realTimeData.reduce((sum, d) => sum + d.disk, 0) / this.realTimeData.length;
    return avg.toFixed(1);
  }

  getUsageClass(usage: number): string {
    if (usage >= 80) return 'usage-critical';
    if (usage >= 60) return 'usage-warning';
    return 'usage-normal';
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
} 