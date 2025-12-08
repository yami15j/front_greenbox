import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';

interface Plantprofile {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  imageUrl: string;
  optimalConditions: {
    tempMin: number;
    tempMax: number;
    humMin: number;
    humMax: number;
    lightMin: number;
    lightMax: number;
    waterMin: number;
  };
  growthTime: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  benefits: string[];
  isActive?: boolean;
}

@Component({
  selector: 'app-plant',
  templateUrl: './plant.page.html',
  styleUrls: ['./plant.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PlantPage implements OnInit {

  selectedPlant: Plantprofile | null = null;
  filteredPlants: Plantprofile[] = [];
  filterType: string = 'all';

  plantProfiles: Plantprofile[] = [
  {
    id: 'basil',
    name: 'Albahaca',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/albahaca.jpg',
    optimalConditions: { tempMin: 18, tempMax: 25, humMin: 55, humMax: 75, lightMin: 65, lightMax: 85, waterMin: 65 },
    growthTime: '20-30 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'strawberry',
    name: 'Fresa',
    type: 'Fruto',
    icon: '🍓',
    imageUrl: 'assets/plants/fresa.jpg',
    optimalConditions: { tempMin: 18, tempMax: 26, humMin: 60, humMax: 80, lightMin: 70, lightMax: 90, waterMin: 70 },
    difficulty: 'Intermedio',
    benefits: [''],
    isActive: false,
    growthTime: '',
    description: ''
  },
  {
    id: 'chives',
    name: 'Cebollín',
    type: 'Hierba Aromática',
    icon: '🧅',
    imageUrl: 'assets/plants/cebollin.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, lightMin: 50, lightMax: 70, waterMin: 60 },
    growthTime: '30-40 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'coriander',
    name: 'Cilantro',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/cilantro.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, lightMin: 50, lightMax: 70, waterMin: 60 },
    growthTime: '20-30 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'kale',
    name: 'Colrizada',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/colrizada.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 60, humMax: 80, lightMin: 60, lightMax: 80, waterMin: 70 },
    growthTime: '45-60 días',
    difficulty: 'Intermedio',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'spinach',
    name: 'Espinaca',
    type: 'Hoja Verde',
    icon: '🥗',
    imageUrl: 'assets/plants/espinacas.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 60, humMax: 80, lightMin: 60, lightMax: 80, waterMin: 70 },
    growthTime: '35-45 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'lettuce',
    name: 'Lechuga',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/lechuga.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 60, humMax: 80, lightMin: 60, lightMax: 80, waterMin: 70 },
    growthTime: '30-45 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'mint',
    name: 'Menta',
    type: 'Hierba Aromática',
    icon: '🌱',
    imageUrl: 'assets/plants/menta.jpg',
    optimalConditions: { tempMin: 16, tempMax: 24, humMin: 60, humMax: 80, lightMin: 50, lightMax: 70, waterMin: 70 },
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'cucumber',
    name: 'Pepino',
    type: 'Fruto',
    icon: '🥒',
    imageUrl: 'assets/plants/pepino.jpg',
    optimalConditions: { tempMin: 18, tempMax: 25, humMin: 50, humMax: 70, lightMin: 70, lightMax: 90, waterMin: 75 },
    growthTime: '50-60 días',
    difficulty: 'Intermedio',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'parsley',
    name: 'Perejil',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/perejil.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, lightMin: 50, lightMax: 70, waterMin: 60 },
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'pepper',
    name: 'Pimiento',
    type: 'Fruto',
    icon: '🌶️',
    imageUrl: 'assets/plants/pimiento.jpg',
    optimalConditions: { tempMin: 20, tempMax: 28, humMin: 50, humMax: 70, lightMin: 80, lightMax: 100, waterMin: 75 },
    growthTime: '60-85 días',
    difficulty: 'Intermedio',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'radish',
    name: 'Rábano',
    type: 'Raíz',
    icon: '🔴',
    imageUrl: 'assets/plants/rabano.jpg',
    optimalConditions: { tempMin: 15, tempMax: 20, humMin: 50, humMax: 70, lightMin: 60, lightMax: 80, waterMin: 60 },
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'arugula',
    name: 'Rúcula',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/rucula.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, lightMin: 60, lightMax: 80, waterMin: 65 },
    growthTime: '30-40 días',
    difficulty: 'Fácil',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'tomato',
    name: 'Tomate',
    type: 'Fruto',
    icon: '🍅',
    imageUrl: 'assets/plants/tomate.jpg',
    optimalConditions: { tempMin: 20, tempMax: 30, humMin: 50, humMax: 70, lightMin: 70, lightMax: 90, waterMin: 75 },
    growthTime: '60-80 días',
    difficulty: 'Intermedio',
    benefits: [''],
    isActive: false,
    description: ''
  },
  {
    id: 'carrot',
    name: 'Zanahoria',
    type: 'Raíz',
    icon: '🥕',
    imageUrl: 'assets/plants/zanahoria.jpg',
    optimalConditions: { tempMin: 16, tempMax: 24, humMin: 50, humMax: 70, lightMin: 70, lightMax: 90, waterMin: 60 },
    growthTime: '70-90 días',
    difficulty: 'Intermedio',
    benefits: [''],
    isActive: false,
    description: ''
  }
];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertController: AlertController,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.loadActivePlant();
    this.applyFilter('all');
  }

  loadActivePlant() {
    const savedPlantId = localStorage.getItem('activePlantId');
    if (savedPlantId) {
      const savedPlant = this.plantProfiles.find(p => p.id === savedPlantId);
      if (savedPlant) {
        this.plantProfiles.forEach(p => p.isActive = false);
        savedPlant.isActive = true;
        this.selectedPlant = savedPlant;
        return;
      }
    }
    this.selectedPlant = this.plantProfiles.find(p => p.isActive) || null;
  }

  applyFilter(type: string) {
    this.filterType = type;
    this.filteredPlants = type === 'all'
      ? [...this.plantProfiles]
      : this.plantProfiles.filter(p => p.type === type);
  }

  async selectPlant(plant: Plantprofile) {
    const confirmAlert = await this.alertController.create({
      header: '¿Activar planta?',
      message: `¿Deseas activar ${plant.name} como tu cultivo actual?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'OK',
          handler: async () => {
            this.plantProfiles.forEach(p => p.isActive = false);
            plant.isActive = true;
            this.selectedPlant = plant;
            localStorage.setItem('activePlantId', plant.id);
            localStorage.setItem('activePlant', JSON.stringify(plant));

            const successAlert = await this.alertController.create({
              header: '✔ Planta Activada',
              message: `${plant.name} ha sido configurada correctamente.`,
              buttons: ['OK']
            });
            await successAlert.present();
            await successAlert.onDidDismiss();
            this.router.navigate(['/home']);
          }
        }
      ]
    });
    await confirmAlert.present();
  }

  getDifficultyColor(difficulty: 'Fácil' | 'Intermedio' | 'Avanzado'): string {
    switch (difficulty) {
      case 'Fácil': return 'success';
      case 'Intermedio': return 'warning';
      case 'Avanzado': return 'danger';
      default: return 'medium';
    }
  }

  goBack() { this.navCtrl.back(); }
}
