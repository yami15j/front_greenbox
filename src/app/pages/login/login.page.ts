import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getAuth } from 'firebase/auth';

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
  isError: boolean = false;
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

  async ionViewWillEnter() {
    this.code = '';
    this.mensaje = '';
    this.isError = false;
    this.loading = false;

    // Si ya existe una caja seleccionada en localStorage, ir a home directamente
    const savedBoxId = localStorage.getItem('selectedBoxId');
    if (savedBoxId) {
      this.router.navigate(['/select'], { replaceUrl: true });
      return;
    }

    // Si no hay caja guardada localmente, pero el usuario está autenticado en Firebase,
    // intentar recuperar su caja desde el backend de manera transparente.
    try {
      const boxId = await this.api.ensureSelectedBox();
      if (boxId) {
        this.router.navigate(['/select'], { replaceUrl: true });
      }
    } catch (e) {
      console.warn('Error al verificar caja activa en ionViewWillEnter:', e);
    }
  }

  async onAccess() {

    // VALIDAR CAMPO VACÍO
    if (!this.code.trim()) {
      this.mensaje = 'Por favor, ingresa un código de acceso';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.mensaje = '';
    this.isError = false;

    try {
      // Llama al ApiService
      const response = await this.api.validateCode(this.code);

      if (response.valid) {
        this.mensaje = 'Código correcto, bienvenido';
        this.isError = false;
        
        // Copiar a las llaves específicas del usuario logueado actualmente
        const currentEmail = localStorage.getItem('currentUserEmail');
        if (currentEmail) {
          const boxId = localStorage.getItem('selectedBoxId');
          if (boxId) {
            localStorage.setItem('selectedBoxId_' + currentEmail, boxId);
          }
          const activePlant = localStorage.getItem('activePlant');
          if (activePlant) {
            localStorage.setItem('activePlant_' + currentEmail, activePlant);
          } else {
            localStorage.removeItem('activePlant_' + currentEmail);
          }
          const activePlantId = localStorage.getItem('activePlantId');
          if (activePlantId) {
            localStorage.setItem('activePlantId_' + currentEmail, activePlantId);
          } else {
            localStorage.removeItem('activePlantId_' + currentEmail);
          }
        }

        setTimeout(() => this.router.navigate(['/select'], { replaceUrl: true }), 800);

      } else {
        this.mensaje = 'Código inválido, intenta de nuevo';
        this.isError = true;
        this.code = '';
      }

    } catch (err) {
      console.error(err);
      this.mensaje = 'Error de conexión. Verifica tu internet';
      this.isError = true;
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

  async logout() {
    try {
      const auth = getAuth();
      await auth.signOut();
    } catch (e) {
      console.error('Error al cerrar sesión en Firebase:', e);
    }
    localStorage.removeItem('selectedBoxId');
    localStorage.removeItem('selectedBoxName');
    localStorage.removeItem('userName');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('activePlant');
    localStorage.removeItem('activePlantId');
    localStorage.removeItem('currentUserEmail');
    this.router.navigate(['/email-login'], { replaceUrl: true });
  }
}
