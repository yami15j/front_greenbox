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
    path: 'select-plant',
    loadComponent: () => import('./pages/select-plant/select-plant.page').then(m => m.SelectPlantPage)
  },

  {
    path: 'guide',
    loadComponent: () => import('./pages/guide/guide.page').then( m => m.GuidePage)
  },

  {
    path: 'notification',
    loadComponent: () => import('./pages/notification/notification.page').then( m => m.NotificationPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'select',
    loadComponent: () => import('./pages/select/select.page').then(m => m.SelectPage)
  },
  {
    path: 'camera',
    loadComponent: () => import('./pages/camera/camera.page').then( m => m.CameraPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'email-login',
    loadComponent: () => import('./pages/email-login/email-login.page').then(m => m.EmailLoginPage)
  }
];
