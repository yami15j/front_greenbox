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
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ApiService } from 'src/app/api.service';

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

  constructor(private router: Router, private api: ApiService) {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline,
               logoGoogle, leafOutline,
               checkmarkCircle, alertCircle });
  }

  togglePass() { this.showPass = !this.showPass; }

  async onGoogleLogin() {
    this.loading = true;
    this.mensaje = '';

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      this.mensaje = '✅ Sesión iniciada con Google';
      
      // Guardar nombre del usuario en localStorage
      localStorage.setItem('userName', user.displayName || 'Usuario Google');

      // Crear su caja en la base de datos si es primera vez
      if (user.email) {
        try {
          await this.api.generateAndSendBoxCode(user.email, user.displayName || 'Usuario Google');
        } catch (dbErr) {
          console.warn('La caja para este correo ya existía o hubo un error al crearla:', dbErr);
        }
      }

      const boxId = localStorage.getItem('selectedBoxId');
      setTimeout(() => {
        if (boxId) {
          this.router.navigateByUrl('/home');
        } else {
          this.router.navigateByUrl('/login');
        }
      }, 800);
    } catch (err: any) {
      console.error('Error Google Sign-In:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        this.mensaje = '⚠️ Ventana de login cerrada';
      } else {
        this.mensaje = `❌ Error de Google: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  async onLogin() {
    if (!this.email.trim() || !this.password.trim()) {
      this.mensaje = '⚠️ Completa todos los campos';
      return;
    }
    this.loading = true;
    this.mensaje = '';

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, this.email.trim(), this.password);

      this.mensaje = '✅ Sesión iniciada correctamente';
      
      // Si ya tiene guardado un código de caja en localstorage, va directo al home.
      // Si no, le redirigimos a ingresar su código de acceso.
      const boxId = localStorage.getItem('selectedBoxId');
      setTimeout(() => {
        if (boxId) {
          this.router.navigateByUrl('/home');
        } else {
          this.router.navigateByUrl('/login');
        }
      }, 800);
    } catch (err: any) {
      console.error('Error de login en Firebase:', err);
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password'
      ) {
        this.mensaje = '❌ Correo o contraseña incorrectos';
      } else if (err.code === 'auth/invalid-email') {
        this.mensaje = '❌ El formato del correo no es válido';
      } else {
        this.mensaje = `❌ Error: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  goLogin()    { this.router.navigateByUrl('/login'); }
  goRegister() { this.router.navigateByUrl('/register'); }
  goCode()     { this.router.navigateByUrl('/login'); }
}
