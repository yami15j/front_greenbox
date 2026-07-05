import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonSpinner, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline, eyeOffOutline, mailOutline,
  logoGoogle, leafOutline,
  checkmarkCircle, alertCircle
} from 'ionicons/icons';

@Component({
  selector: 'app-email-login',
  templateUrl: './email-login.page.html',
  styleUrls:  ['./email-login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSpinner, IonIcon]
})
export class EmailLoginPage {

  email     = '';
  password  = '';
  showPass  = false;
  mensaje   = '';
  loading   = false;

  constructor(private router: Router) {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline,
               logoGoogle, leafOutline,
               checkmarkCircle, alertCircle });
  }

  togglePass() { this.showPass = !this.showPass; }

  async onLogin() {
    if (!this.email.trim() || !this.password.trim()) {
      this.mensaje = '⚠️ Completa todos los campos';
      return;
    }
    this.loading = true;
    this.mensaje = '';
    // TODO: conectar con endpoint real de autenticación cuando esté disponible
    setTimeout(() => {
      this.loading = false;
      this.mensaje = '✅ Sesión iniciada correctamente';
      setTimeout(() => this.router.navigateByUrl('/home'), 800);
    }, 1200);
  }

  goLogin()    { this.router.navigateByUrl('/login'); }
  goRegister() { this.router.navigateByUrl('/register'); }
  goCode()     { this.router.navigateByUrl('/login'); }
}
