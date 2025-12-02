import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { StatCardComponent } from 'src/app/components/stat-card/stat-card.component';
import { TopCardComponent } from 'src/app/components/top-card/top-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    StatCardComponent,
    TopCardComponent
  ]
})
export class HomePage {
  // puedes definir variables para pasarle a los componentes si quieres
}
