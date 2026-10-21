import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Login } from './login/login';
import { Achievements } from './achievements/achievements';

export const routes: Routes = [
    {
        path: '',
        component: Login
    },
    
    {
        path: 'dashboard',
        component: Dashboard
    },

    {
        path: 'game/:appid',
        component: Achievements
    }
];

