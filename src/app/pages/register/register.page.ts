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
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ApiService } from 'src/app/api.service';

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

  constructor(private router: Router, private api: ApiService) {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline,
               personOutline, checkmarkCircle, alertCircle });
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

      this.mensaje = '✅ Registro y sesión iniciada con Google';
      
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

  async onRegister() {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
      this.mensaje = '⚠️ Completa todos los campos';
      return;
    }
    this.loading = true;
    this.mensaje = '';

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, this.email.trim(), this.password);
      
      // Guardar nombre del usuario en localStorage
      localStorage.setItem('userName', this.fullName.trim());

      // Llamar al backend para generar su nueva caja y enviarle el código de acceso
      await this.api.generateAndSendBoxCode(this.email.trim(), this.fullName.trim());

      this.mensaje = '✅ Cuenta creada exitosamente. Revisa tu correo.';
      setTimeout(() => this.router.navigateByUrl('/login'), 1500);
    } catch (err: any) {
      console.error('Error de registro en Firebase:', err);
      // Traducir los errores más comunes de Firebase a español
      if (err.code === 'auth/email-already-in-use') {
        this.mensaje = '❌ Este correo ya está registrado';
      } else if (err.code === 'auth/invalid-email') {
        this.mensaje = '❌ El correo ingresado no es válido';
      } else if (err.code === 'auth/weak-password') {
        this.mensaje = '❌ La contraseña debe tener al menos 6 caracteres';
      } else {
        this.mensaje = `❌ Error: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  goLogin()  { this.router.navigateByUrl('/login'); }
  goEmailLogin() { this.router.navigateByUrl('/email-login'); }
}
