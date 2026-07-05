import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonSpinner,
  IonIcon
} from '@ionic/angular/standalone';

import { ApiService } from '../../api.service';
import { addIcons } from 'ionicons';
import {
  lockClosedOutline,
  keyOutline,
  arrowForwardOutline,
  checkmarkCircle,
  alertCircle,
  shieldCheckmarkOutline,
  mailOutline,
  leafOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonLabel,
    IonSpinner,
    IonIcon
  ],
})
export class LoginPage {

  code: string = '';
  mensaje: string = '';
  loading: boolean = false;

  constructor(private router: Router, private api: ApiService) {
    addIcons({
      lockClosedOutline,
      keyOutline,
      arrowForwardOutline,
      checkmarkCircle,
      alertCircle,
      shieldCheckmarkOutline,
      mailOutline,
      leafOutline
    });
  }

  async onAccess() {

    // 🟡 VALIDAR CAMPO VACÍO
    if (!this.code.trim()) {
      this.mensaje = '⚠️ Por favor, ingresa un código de acceso';
      return;
    }

    this.loading = true;
    this.mensaje = '';

    try {
      // 🔵 Llama al ApiService
      const response = await this.api.validateCode(this.code);

      if (response.valid) {
        this.mensaje = '✅ Código correcto, bienvenido!';
        // El boxId ya fue guardado en localStorage por el ApiService
        setTimeout(() => this.router.navigateByUrl('/home'), 800);

      } else {
        this.mensaje = '❌ Código inválido, intenta de nuevo';
        this.code = '';
      }

    } catch (err) {
      console.error(err);
      this.mensaje = '⚠️ Error de conexión. Verifica tu internet';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Método de logout para limpiar localStorage
   * Llamar este método cuando el usuario cierre sesión
   */
  goEmailLogin() { this.router.navigateByUrl('/email-login'); }
  goRegister()    { this.router.navigateByUrl('/register'); }

  logout() {
    localStorage.removeItem('selectedBoxId');
    localStorage.removeItem('activePlant');
    localStorage.removeItem('activePlantId');
    this.router.navigateByUrl('/login');
  }
}
