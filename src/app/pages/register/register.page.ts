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
  personOutline, checkmarkCircle, alertCircle
} from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls:  ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSpinner, IonIcon]
})
export class RegisterPage {

  fullName    = '';
  email       = '';
  password    = '';
  showPass    = false;
  mensaje     = '';
  loading     = false;

  constructor(private router: Router) {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline,
               personOutline, checkmarkCircle, alertCircle });
  }

  togglePass() { this.showPass = !this.showPass; }

  async onRegister() {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
      this.mensaje = '⚠️ Completa todos los campos';
      return;
    }
    this.loading = true;
    this.mensaje = '';
    // TODO: conectar con endpoint real de registro cuando esté disponible
    setTimeout(() => {
      this.loading = false;
      this.mensaje = '✅ Cuenta creada exitosamente';
      setTimeout(() => this.router.navigateByUrl('/login'), 1200);
    }, 1200);
  }

  goLogin()  { this.router.navigateByUrl('/login'); }
  goEmailLogin() { this.router.navigateByUrl('/email-login'); }
}
