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
  logoGoogle,
  leafOutline,
  checkmarkCircle,
  alertCircle,
} from 'ionicons/icons';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-email-login',
  templateUrl: './email-login.page.html',
  styleUrls: ['./email-login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSpinner, IonIcon],
})
export class EmailLoginPage {
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
      logoGoogle,
      leafOutline,
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
      const result = await FirebaseAuthentication.signInWithGoogle();
      
      if (!result.credential?.idToken) {
        throw new Error('Google no devolvio un token de acceso (idToken) valido.');
      }

      const credential = GoogleAuthProvider.credential(result.credential.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

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

      let boxId = localStorage.getItem('selectedBoxId');
      if (!boxId) {
        const emailSent = await this.requestAccessCode(email, name, user.uid);
        if (!emailSent) {
          return;
        }
      } else {
        this.mensaje = 'Sesion iniciada correctamente con Google.';
      }

      if (!boxId) {
        try {
          boxId = await this.api.ensureSelectedBox();
        } catch (dbErr) {
          console.warn(
            'No se pudo recuperar la caja desde el backend en Google login:',
            dbErr,
          );
        }
      }

      setTimeout(async () => {
        if (boxId) {
          try {
            const info = await this.api.getBoxInfo(boxId);
            if (info?.box?.plant) {
              localStorage.setItem('activePlant', JSON.stringify(info.box.plant));
              localStorage.setItem('activePlantId', String(info.box.plant.id));
              localStorage.setItem('activePlant_' + email, JSON.stringify(info.box.plant));
              if (info.box.userPlantId) {
                localStorage.setItem('activeUserPlantId', String(info.box.userPlantId));
              }
              this.router.navigate(['/home'], { replaceUrl: true });
              return;
            }
          } catch (e) {
            console.warn('No se pudo obtener info de la caja en login', e);
          }
          this.router.navigate(['/select'], { replaceUrl: true });
        } else {
          this.router.navigate(['/login'], { replaceUrl: true });
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
          'No se pudo iniciar sesion con Google.',
        );
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        this.email.trim(),
        this.password,
      );
      const user = userCredential.user;
      const email = this.email.trim().toLowerCase();

      localStorage.setItem('currentUserEmail', email);

      const displayName = user.displayName || email.split('@')[0] || 'Usuario';
      localStorage.setItem(
        'userName',
        displayName.charAt(0).toUpperCase() + displayName.slice(1),
      );

      let boxId = localStorage.getItem(`selectedBoxId_${email}`);
      if (boxId) {
        localStorage.setItem('selectedBoxId', boxId);
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

      if (!boxId) {
        try {
          boxId = await this.api.ensureSelectedBox();
        } catch (dbErr) {
          console.warn(
            'No se pudo recuperar la caja desde el backend al iniciar sesion:',
            dbErr,
          );
        }
      }

      this.mensaje = 'Sesion iniciada correctamente';
      this.isError = false;

      setTimeout(async () => {
        if (boxId) {
          try {
            const info = await this.api.getBoxInfo(boxId);
            if (info?.box?.plant) {
              localStorage.setItem('activePlant', JSON.stringify(info.box.plant));
              localStorage.setItem('activePlantId', String(info.box.plant.id));
              localStorage.setItem('activePlant_' + email, JSON.stringify(info.box.plant));
              if (info.box.userPlantId) {
                localStorage.setItem('activeUserPlantId', String(info.box.userPlantId));
              }
              this.router.navigate(['/home'], { replaceUrl: true });
              return;
            }
          } catch (e) {
            console.warn('No se pudo obtener info de la caja en login', e);
          }
          this.router.navigate(['/select'], { replaceUrl: true });
        } else {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      }, 800);
    } catch (err: any) {
      console.error('Error de login en Firebase:', err);
      this.isError = true;

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        this.mensaje = 'Correo o contrasena incorrectos';
      } else if (err.code === 'auth/invalid-email') {
        this.mensaje = 'El formato del correo no es valido';
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

  goRegister() {
    this.router.navigateByUrl('/register');
  }

  goCode() {
    this.router.navigateByUrl('/login');
  }
}
