import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-performance-metric',
  templateUrl: './performance-metric.component.html',
  standalone: true,
  imports: [CommonModule, NgChartsModule]
})
export class PerformanceMetricComponent implements OnInit {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() change?: number;
  @Input() timeLabels: string[] = [];
  @Input() viewMode: 'grid' | 'list' = 'grid';

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        fill: true,
        tension: 0.5,
        borderColor: '#93adc8',
        backgroundColor: 'rgba(36, 54, 71, 0.2)',
        pointRadius: 0
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    }
  };

  ngOnInit() {
    // Generate random data for demo
    const data = Array.from({ length: this.timeLabels.length }, () => 
      Math.floor(Math.random() * 100)
    );
    
    this.lineChartData.labels = this.timeLabels;
    this.lineChartData.datasets[0].data = data;
    this.lineChartData.datasets[0].label = this.title;
  }
} 