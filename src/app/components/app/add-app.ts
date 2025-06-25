import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  selector: 'add-app',
  templateUrl: './add-app.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class AddAppComponent {
  newApp: Partial<Application> = {
    name: '',
    status: 'Running',
    environment: 'demo',
    version: '',
    description: ''
  };
  submitting = false;

  constructor(private router: Router) {}

  addApp() {
    if (!this.newApp.name || !this.newApp.version || !this.newApp.description) return;
    // Lưu tạm vào localStorage (giả lập gửi về list)
    const now = new Date();
    const app: Application = {
      id: Date.now(),
      name: this.newApp.name!,
      status: this.newApp.status as 'Running' | 'Stopped' | 'Error',
      environment: this.newApp.environment as 'demo' | 'staging' | 'production',
      version: this.newApp.version!,
      lastUpdated: now.toISOString().slice(0, 16).replace('T', ' '),
      description: this.newApp.description!
    };
    const addedApps = JSON.parse(localStorage.getItem('addedApps') || '[]');
    addedApps.unshift(app);
    localStorage.setItem('addedApps', JSON.stringify(addedApps));
    this.submitting = true;
    setTimeout(() => {
      this.router.navigate(['/app']);
    }, 500);
  }

  cancel() {
    this.router.navigate(['/app']);
  }
} 