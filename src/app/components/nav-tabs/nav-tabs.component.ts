import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tab {
  label: string;
  href: string;
  active: boolean;
}

@Component({
  selector: 'app-nav-tabs',
  templateUrl: './nav-tabs.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class NavTabsComponent {
  @Input() tabs: Tab[] = [];
} 