import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { getAuth } from 'firebase/auth';
import { waitForFirebaseAuth } from '../../firebase-auth.utils';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent],
})
export class SplashPage implements OnInit {
  constructor(private router: Router, private api: ApiService) {}

  async ngOnInit() {
    // Esperar a que Firebase Auth esté listo
    await waitForFirebaseAuth(3000);

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const savedBoxId = localStorage.getItem('selectedBoxId');
      if (savedBoxId) {
        this.router.navigateByUrl('/home');
      } else {
        try {
          const boxId = await this.api.ensureSelectedBox();
          if (boxId) {
            this.router.navigateByUrl('/home');
          } else {
            this.router.navigateByUrl('/login');
          }
        } catch (e) {
          this.router.navigateByUrl('/login');
        }
      }
    } else {
      // Si no está logueado en Firebase, enviarlo a iniciar sesión por correo/contraseña
      this.router.navigateByUrl('/email-login');
    }
  }
}