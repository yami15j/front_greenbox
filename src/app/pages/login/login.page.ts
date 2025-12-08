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
  IonSpinner
} from '@ionic/angular/standalone';

import { ApiService } from '../../api.service';

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
    IonSpinner
  ],
})
export class LoginPage {

  code: string = '';
  mensaje: string = '';
  loading: boolean = false;

  constructor(private router: Router, private api: ApiService) {}

  async onAccess() {

    // 🟡 VALIDAR CAMPO VACÍO
    if (!this.code.trim()) {
      this.mensaje = '⚠️ Por favor, ingresa un código de acceso';
      return;
    }

    this.loading = true;
    this.mensaje = '';

    try {
      // 🔵 Llama al ApiService (simulado)
      const isValid = await this.api.validateCode(this.code);

      if (isValid) {
        this.mensaje = '✅ Código correcto, bienvenido!';
        setTimeout(() => this.router.navigateByUrl('/plant'), 800);

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
}
