import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent],
})
export class SplashPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      const email = localStorage.getItem('currentUserEmail');
      if (email) {
        // Si ya inició sesión antes
        const boxId = localStorage.getItem('selectedBoxId');
        if (boxId) {
          const activePlant = localStorage.getItem('activePlant');
          if (activePlant) {
            // Si ya tiene planta seleccionada, ir directo a home
            this.router.navigateByUrl('/home', { replaceUrl: true });
          } else {
            // Si tiene caja pero aún no selecciona planta
            this.router.navigateByUrl('/select', { replaceUrl: true });
          }
        } else {
          // Si falta ingresar el código de la caja
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      } else {
        // Si no ha iniciado sesión, ir al login de email/Google
        this.router.navigateByUrl('/email-login', { replaceUrl: true });
      }
    }, 2500);
  }
}