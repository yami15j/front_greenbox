import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  personOutline,
  checkmarkCircle,
  alertCircle,
} from 'ionicons/icons';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSpinner, IonIcon],
})
export class RegisterPage {
  fullName = '';
  email = '';
  password = '';
  showPass = false;
  mensaje = '';
  isError = false;
  loading = false;

  constructor(private router: Router, private api: ApiService) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      mailOutline,
      personOutline,
      checkmarkCircle,
      alertCircle,
    });
  }

  togglePass() {
    this.showPass = !this.showPass;
  }

  private getApiErrorMessage(err: any, fallback: string): string {
    return err?.error?.message || err?.message || fallback;
  }

  private async requestAccessCode(
    email: string,
    name: string,
    firebaseUid?: string,
  ): Promise<boolean> {
    try {
      const response = await this.api.generateAndSendBoxCode(email, name, firebaseUid);
      this.mensaje =
        response?.message || 'Te enviamos tu codigo de acceso al correo registrado.';
      this.isError = false;
      return true;
    } catch (err: any) {
      console.error('Error enviando codigo por correo:', err);
      this.mensaje = this.getApiErrorMessage(
        err,
        'No pudimos enviarte el codigo por correo. Intenta de nuevo en unos minutos.',
      );
      this.isError = true;
      return false;
    }
  }

  async onGoogleLogin() {
    this.loading = true;
    this.mensaje = '';
    this.isError = false;

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error('Google no devolvio un correo valido para esta cuenta.');
      }

      const email = user.email.trim().toLowerCase();
      const name = user.displayName || 'Usuario Google';

      localStorage.setItem('currentUserEmail', email);
      localStorage.setItem('userName', name);

      const savedBoxId = localStorage.getItem(`selectedBoxId_${email}`);
      if (savedBoxId) {
        localStorage.setItem('selectedBoxId', savedBoxId);
      } else {
        localStorage.removeItem('selectedBoxId');
      }

      const savedPlant = localStorage.getItem(`activePlant_${email}`);
      if (savedPlant) {
        localStorage.setItem('activePlant', savedPlant);
      } else {
        localStorage.removeItem('activePlant');
      }

      const savedPlantId = localStorage.getItem(`activePlantId_${email}`);
      if (savedPlantId) {
        localStorage.setItem('activePlantId', savedPlantId);
      } else {
        localStorage.removeItem('activePlantId');
      }

      const emailSent = await this.requestAccessCode(email, name, user.uid);
      if (!emailSent) {
        return;
      }

      const boxId = localStorage.getItem('selectedBoxId');
      setTimeout(() => {
        if (boxId) {
          this.router.navigateByUrl('/select');
        } else {
          this.router.navigateByUrl('/login');
        }
      }, 800);
    } catch (err: any) {
      console.error('Error Google Sign-In:', err);
      this.isError = true;

      if (err.code === 'auth/popup-closed-by-user') {
        this.mensaje = 'Ventana de login cerrada';
      } else {
        this.mensaje = this.getApiErrorMessage(
          err,
          'No se pudo registrar con Google.',
        );
      }
    } finally {
      this.loading = false;
    }
  }

  async onRegister() {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
      this.mensaje = 'Completa todos los campos';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.mensaje = '';
    this.isError = false;

    try {
      const auth = getAuth();
      const email = this.email.trim().toLowerCase();
      const name = this.fullName.trim();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        this.password,
      );

      await updateProfile(userCredential.user, { displayName: name });

      localStorage.setItem('userName', name);
      localStorage.setItem('currentUserEmail', email);
      localStorage.removeItem('selectedBoxId');
      localStorage.removeItem('activePlant');
      localStorage.removeItem('activePlantId');

      const emailSent = await this.requestAccessCode(email, name, userCredential.user.uid);
      if (!emailSent) {
        this.mensaje =
          'Tu cuenta fue creada, pero no pudimos enviarte el codigo. Intenta iniciar sesion de nuevo para reenviarlo.';
        this.isError = true;
        return;
      }

      this.mensaje =
        'Cuenta creada. Revisa tu correo electronico para obtener tu codigo de acceso.';
      this.isError = false;
      setTimeout(() => this.router.navigateByUrl('/login'), 4000);
    } catch (err: any) {
      console.error('Error de registro en Firebase:', err);
      this.isError = true;

      if (err.code === 'auth/email-already-in-use') {
        this.mensaje = 'Este correo ya esta registrado';
      } else if (err.code === 'auth/invalid-email') {
        this.mensaje = 'El correo ingresado no es valido';
      } else if (err.code === 'auth/weak-password') {
        this.mensaje = 'La contrasena debe tener al menos 6 caracteres';
      } else {
        this.mensaje = `Error: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }

  goEmailLogin() {
    this.router.navigateByUrl('/email-login');
  }
}
