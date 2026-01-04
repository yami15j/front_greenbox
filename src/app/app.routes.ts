import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then(m => m.SplashPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage),
  },
  {
    path: 'weekly',
    loadComponent: () => import('./pages/weekly/weekly.page').then(m => m.WeeklyPage),
  },
  
  {
    path: 'plant',
    loadComponent: () => import('./pages/plant/plant.page').then( m => m.PlantPage)
  },

  {
    path: 'guide',
    loadComponent: () => import('./pages/guide/guide.page').then( m => m.GuidePage)
  },
  {
    path: 'mont',
    loadComponent: () => import('./pages/mont/mont.page').then( m => m.MontPage)
  },
  {
    path: 'notification',
    loadComponent: () => import('./pages/notification/notification.page').then( m => m.NotificationPage)
  },
];
