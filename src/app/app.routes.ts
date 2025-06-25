import { Routes } from '@angular/router';
import { AppListComponent } from './components/app/app';
import { AppDetailComponent } from './components/app/app-detail';
import { AddAppComponent } from './components/app/add-app';
import { ResourceDetailComponent } from './components/resource/resource-detail';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
    { path: '', redirectTo: '/app', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent},
    { path: 'app', component: AppListComponent },
    { path: 'app/add', component: AddAppComponent },
    { path: 'app/:id', component: AppDetailComponent },
    { path: 'app/:appId/resource/:resourceId', component: ResourceDetailComponent },
    { path: '**', redirectTo: '/app' } // Wildcard route for a 404-like redirect
];
