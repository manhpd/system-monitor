import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Application {
  id: number;
  name: string;
  status: 'Running' | 'Stopped' | 'Error';
  version: string;
  lastUpdated: string;
  description: string;
  environment: 'demo' | 'staging' | 'production';
}

@Component({
  selector: 'app-header',
  templateUrl: './app.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class AppListComponent {
  protected title = 'System Monitor';
  protected applications: Application[] = [
    {
      id: 1,
      name: 'TopHat',
      status: 'Running',
      version: '2.1.0',
      lastUpdated: '2024-01-15 10:30:00',
      description: 'Hệ thống quản lý học tập và tương tác trong lớp học',
      environment: 'production'
    },
    {
      id: 2,
      name: 'Teacher Zone',
      status: 'Running',
      version: '1.8.5',
      lastUpdated: '2024-01-15 09:15:00',
      description: 'Nền tảng quản lý giáo viên và tài liệu giảng dạy',
      environment: 'staging'
    },
    {
      id: 3,
      name: 'Restaurant Pro System',
      status: 'Stopped',
      version: '3.2.1',
      lastUpdated: '2024-01-14 16:45:00',
      description: 'Hệ thống quản lý nhà hàng và đặt bàn',
      environment: 'demo'
    },
    {
      id: 4,
      name: 'EduConnect',
      status: 'Running',
      version: '1.5.3',
      lastUpdated: '2024-01-15 11:20:00',
      description: 'Nền tảng kết nối giáo dục trực tuyến',
      environment: 'production'
    },
    {
      id: 5,
      name: 'Smart Inventory',
      status: 'Error',
      version: '4.0.2',
      lastUpdated: '2024-01-15 08:30:00',
      description: 'Hệ thống quản lý kho thông minh',
      environment: 'staging'
    },
    {
      id: 6,
      name: 'Customer Portal',
      status: 'Running',
      version: '2.3.1',
      lastUpdated: '2024-01-15 12:00:00',
      description: 'Cổng thông tin khách hàng và dịch vụ',
      environment: 'production'
    },
    {
      id: 7,
      name: 'Analytics Dashboard',
      status: 'Running',
      version: '1.9.0',
      lastUpdated: '2024-01-15 13:15:00',
      description: 'Bảng điều khiển phân tích dữ liệu',
      environment: 'demo'
    },
    {
      id: 8,
      name: 'Payment Gateway',
      status: 'Running',
      version: '2.7.3',
      lastUpdated: '2024-01-15 14:20:00',
      description: 'Cổng thanh toán và xử lý giao dịch',
      environment: 'production'
    }
  ];

  protected showAddForm = false;
  protected newApp: Partial<Application> = {
    name: '',
    status: 'Running',
    environment: 'demo',
    version: '',
    description: ''
  };

  get totalApps(): number {
    return this.applications.length;
  }

  get runningApps(): number {
    return this.applications.filter(app => app.status === 'Running').length;
  }

  get stoppedApps(): number {
    return this.applications.filter(app => app.status === 'Stopped').length;
  }

  get errorApps(): number {
    return this.applications.filter(app => app.status === 'Error').length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Running':
        return 'status-running';
      case 'Stopped':
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

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newApp = {
        name: '',
        status: 'Running',
        environment: 'demo',
        version: '',
        description: ''
      };
    }
  }

  addApp() {
    if (!this.newApp.name || !this.newApp.version || !this.newApp.description) return;
    const newId = this.applications.length > 0 ? Math.max(...this.applications.map(a => a.id)) + 1 : 1;
    const now = new Date();
    this.applications.unshift({
      id: newId,
      name: this.newApp.name!,
      status: this.newApp.status as 'Running' | 'Stopped' | 'Error',
      environment: this.newApp.environment as 'demo' | 'staging' | 'production',
      version: this.newApp.version!,
      lastUpdated: now.toISOString().slice(0, 16).replace('T', ' '),
      description: this.newApp.description!
    });
    this.toggleAddForm();
  }
} 