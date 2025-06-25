import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { NavTabsComponent } from './components/nav-tabs/nav-tabs.component';
import { DashboardComponent } from './components/dashboard/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, DashboardComponent, NavTabsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'system-monitor';
  protected navTabs: Tab[] = [
    { label: 'Overview', href: '#', active: false },
    { label: 'Issues', href: '#', active: false },
    { label: 'Performance', href: '#', active: true },
    { label: 'Database', href: '#', active: false },
    { label: 'Logs', href: '#', active: false },
    { label: 'Traces', href: '#', active: false },
    { label: 'Uptime', href: '#', active: false }
  ];
}


interface Tab {
  label: string;
  href: string;
  active: boolean;
}

