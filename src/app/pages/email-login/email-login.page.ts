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
  isError   = false;
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
    this.isError = false;

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      this.mensaje = 'Sesión iniciada con Google';
      this.isError = false;
      
      if (user.email) {
        // Guardar email del usuario actual y su nombre
        localStorage.setItem('currentUserEmail', user.email);
        localStorage.setItem('userName', user.displayName || 'Usuario Google');

        // Cargar boxId guardado para este correo
        const savedBoxId = localStorage.getItem('selectedBoxId_' + user.email);
        if (savedBoxId) {
          localStorage.setItem('selectedBoxId', savedBoxId);
        } else {
          localStorage.removeItem('selectedBoxId');
        }

        // Cargar activePlant guardada para este correo
        const savedPlant = localStorage.getItem('activePlant_' + user.email);
        if (savedPlant) {
          localStorage.setItem('activePlant', savedPlant);
        } else {
          localStorage.removeItem('activePlant');
        }

        const savedPlantId = localStorage.getItem('activePlantId_' + user.email);
        if (savedPlantId) {
          localStorage.setItem('activePlantId', savedPlantId);
        } else {
          localStorage.removeItem('activePlantId');
        }

        // Crear su caja en la base de datos si es primera vez
        try {
          await this.api.generateAndSendBoxCode(user.email, user.displayName || 'Usuario Google');
        } catch (dbErr) {
          console.warn('La caja para este correo ya existía o hubo un error al crearla:', dbErr);
        }
      }

      setTimeout(() => {
        this.router.navigateByUrl('/select');
      }, 800);
    } catch (err: any) {
      console.error('Error Google Sign-In:', err);
      this.isError = true;
      if (err.code === 'auth/popup-closed-by-user') {
        this.mensaje = 'Ventana de login cerrada';
      } else {
        this.mensaje = `Error de Google: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  async onLogin() {
    if (!this.email.trim() || !this.password.trim()) {
      this.mensaje = 'Completa todos los campos';
      this.isError = true;
      return;
    }
    this.loading = true;
    this.mensaje = '';
    this.isError = false;

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, this.email.trim(), this.password);
      const user = userCredential.user;

      this.mensaje = 'Sesión iniciada correctamente';
      this.isError = false;
      
      const email = this.email.trim().toLowerCase();
      localStorage.setItem('currentUserEmail', email);
      
      // Intentar obtener el nombre del usuario
      const displayName = user.displayName || email.split('@')[0] || 'Usuario';
      localStorage.setItem('userName', displayName.charAt(0).toUpperCase() + displayName.slice(1));

      // Cargar boxId guardado para este correo
      const savedBoxId = localStorage.getItem('selectedBoxId_' + email);
      if (savedBoxId) {
        localStorage.setItem('selectedBoxId', savedBoxId);
      } else {
        localStorage.removeItem('selectedBoxId');
      }

      // Cargar activePlant guardada para este correo
      const savedPlant = localStorage.getItem('activePlant_' + email);
      if (savedPlant) {
        localStorage.setItem('activePlant', savedPlant);
      } else {
        localStorage.removeItem('activePlant');
      }

      const savedPlantId = localStorage.getItem('activePlantId_' + email);
      if (savedPlantId) {
        localStorage.setItem('activePlantId', savedPlantId);
      } else {
        localStorage.removeItem('activePlantId');
      }

      setTimeout(() => {
        this.router.navigateByUrl('/select');
      }, 800);
    } catch (err: any) {
      console.error('Error de login en Firebase:', err);
      this.isError = true;
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password'
      ) {
        this.mensaje = 'Correo o contraseña incorrectos';
      } else if (err.code === 'auth/invalid-email') {
        this.mensaje = 'El formato del correo no es válido';
      } else {
        this.mensaje = `Error: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  goLogin()    { this.router.navigateByUrl('/login'); }
  goRegister() { this.router.navigateByUrl('/register'); }
  goCode()     { this.router.navigateByUrl('/login'); }
}
