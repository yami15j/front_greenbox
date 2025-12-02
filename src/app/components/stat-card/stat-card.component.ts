import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
})
export class StatCardComponent {
  @Input() title!: string;
  @Input() value!: string;
  @Input() unit?: string;
  @Input() icon?: string; // usar ionicons o svg
  @Input() statusText?: string; // Óptimo, Bajo...
}
