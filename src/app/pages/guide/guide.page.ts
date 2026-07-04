import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface GuideStep {
  id: number;
  step: number;
  title: string;
  description: string;
  image?: string;
}

interface PlantGuides {
  id: number;
  name: string;
  guides: GuideStep[];
  totalGuides: number;
}

@Component({
  selector: 'app-guide',
  templateUrl: './guide.page.html',
  styleUrls: ['./guide.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class GuidePage implements OnInit {

  isLoading = false;
  plants: PlantGuides[] = [];
  activePlantId: number | null = null;

  private backendUrl = 'http://localhost:3000'; // Ajusta según tu backend

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadActivePlant();
  }

  async loadActivePlant() {
    const plant = localStorage.getItem('activePlant');
    if (plant) {
      try {
        this.activePlantId = JSON.parse(plant).id;
      } catch {
        this.activePlantId = null;
      }
    }
    if (this.activePlantId) {
      await this.loadGuides(this.activePlantId);
    }
  }

  async loadGuides(plantId: number) {
    this.isLoading = true;
    try {
      const res: any = await this.http
        .get(`${this.backendUrl}/guide/plant/${plantId}`)
        .toPromise();
      this.plants = res.plants; // Agrupado por planta desde backend
    } catch (err) {
      console.error('Error cargando guías:', err);
    } finally {
      this.isLoading = false;
    }
  }

  goBack() { this.navCtrl.back(); }
  goHome() { this.navCtrl.navigateBack('/home'); }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  refreshData(event: any) {
    setTimeout(() => {
      if (this.activePlantId) this.loadGuides(this.activePlantId);
      event.target.complete();
    }, 1000);
  }

  openSupport() {
    window.open('mailto:soporte@greenbox.com', '_system');
  }
}
