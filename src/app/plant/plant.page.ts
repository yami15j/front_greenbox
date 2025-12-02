import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

interface Plantprofile {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
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
  templateUrl: './plant.page.html',    // ✅ Correcto
  styleUrls: ['./plant.page.scss'],    // ✅ Correcto
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PlantPage implements OnInit {    // ✅ Cambié PlantsPage a PlantPage
  
  selectedPlant: Plantprofile | null = null;
  
  plantProfiles: Plantprofile[] = [
    {
      id: 'lettuce',
      name: 'Lechuga',
      type: 'Hoja Verde',
      icon: '🥬',
      description: 'Vegetal de hoja verde, ideal para principiantes. Crece rápido y requiere poco mantenimiento.',
      optimalConditions: {
        tempMin: 15,
        tempMax: 22,
        humMin: 60,
        humMax: 80,
        lightMin: 60,
        lightMax: 80,
        waterMin: 70
      },
      growthTime: '30-45 días',
      difficulty: 'Fácil',
      benefits: ['Crece rápido', 'Bajo mantenimiento', 'Rica en nutrientes'],
      isActive: true
    },
    {
      id: 'tomato',
      name: 'Tomate',
      type: 'Fruto',
      icon: '🍅',
      description: 'Planta frutal versátil, requiere más luz y nutrientes. Producción abundante.',
      optimalConditions: {
        tempMin: 20,
        tempMax: 30,
        humMin: 50,
        humMax: 70,
        lightMin: 70,
        lightMax: 90,
        waterMin: 75
      },
      growthTime: '60-80 días',
      difficulty: 'Intermedio',
      benefits: ['Alta producción', 'Versátil en cocina', 'Rico en vitamina C'],
      isActive: false
    },
    {
      id: 'basil',
      name: 'Albahaca',
      type: 'Hierba Aromática',
      icon: '🌿',
      description: 'Hierba aromática perfecta para cocina. Crece rápido y es fácil de cuidar.',
      optimalConditions: {
        tempMin: 18,
        tempMax: 25,
        humMin: 55,
        humMax: 75,
        lightMin: 65,
        lightMax: 85,
        waterMin: 65
      },
      growthTime: '20-30 días',
      difficulty: 'Fácil',
      benefits: ['Aromática', 'Uso culinario', 'Repele insectos'],
      isActive: false
    },
    {
      id: 'strawberry',
      name: 'Fresa',
      type: 'Fruto',
      icon: '🍓',
      description: 'Fruta dulce y nutritiva. Requiere atención especial en temperatura y luz.',
      optimalConditions: {
        tempMin: 15,
        tempMax: 25,
        humMin: 60,
        humMax: 80,
        lightMin: 75,
        lightMax: 90,
        waterMin: 80
      },
      growthTime: '90-120 días',
      difficulty: 'Avanzado',
      benefits: ['Fruta deliciosa', 'Alto valor nutricional', 'Floración decorativa'],
      isActive: false
    },
    {
      id: 'spinach',
      name: 'Espinaca',
      type: 'Hoja Verde',
      icon: '🥗',
      description: 'Vegetal nutritivo y resistente. Tolera temperaturas más bajas.',
      optimalConditions: {
        tempMin: 12,
        tempMax: 20,
        humMin: 65,
        humMax: 85,
        lightMin: 55,
        lightMax: 75,
        waterMin: 70
      },
      growthTime: '40-50 días',
      difficulty: 'Fácil',
      benefits: ['Rica en hierro', 'Resistente al frío', 'Alta producción'],
      isActive: false
    },
    {
      id: 'cilantro',
      name: 'Cilantro',
      type: 'Hierba Aromática',
      icon: '🌱',
      description: 'Hierba aromática popular en cocina latina. Crece rápido en condiciones frescas.',
      optimalConditions: {
        tempMin: 16,
        tempMax: 24,
        humMin: 50,
        humMax: 70,
        lightMin: 60,
        lightMax: 80,
        waterMin: 65
      },
      growthTime: '25-35 días',
      difficulty: 'Fácil',
      benefits: ['Sabor único', 'Crece rápido', 'Uso culinario amplio'],
      isActive: false
    },
    {
      id: 'pepper',
      name: 'Pimiento',
      type: 'Fruto',
      icon: '🌶️',
      description: 'Vegetal versátil con variedades dulces y picantes. Requiere calor constante.',
      optimalConditions: {
        tempMin: 21,
        tempMax: 29,
        humMin: 50,
        humMax: 70,
        lightMin: 75,
        lightMax: 90,
        waterMin: 70
      },
      growthTime: '60-90 días',
      difficulty: 'Intermedio',
      benefits: ['Rico en vitaminas', 'Variedades múltiples', 'Larga producción'],
      isActive: false
    },
    {
      id: 'mint',
      name: 'Menta',
      type: 'Hierba Aromática',
      icon: '🍃',
      description: 'Hierba refrescante de rápido crecimiento. Excelente para infusiones y postres.',
      optimalConditions: {
        tempMin: 15,
        tempMax: 25,
        humMin: 60,
        humMax: 80,
        lightMin: 50,
        lightMax: 70,
        waterMin: 75
      },
      growthTime: '15-25 días',
      difficulty: 'Fácil',
      benefits: ['Crece muy rápido', 'Aromática intensa', 'Uso medicinal'],
      isActive: false
    },
    {
      id: 'carrot',
      name: 'Zanahoria',
      type: 'Raíz',
      icon: '🥕',
      description: 'Hortaliza de raíz nutritiva. Ideal para cultivos profundos y frescos.',
      optimalConditions: {
        tempMin: 16,
        tempMax: 21,
        humMin: 65,
        humMax: 75,
        lightMin: 60,
        lightMax: 80,
        waterMin: 70
      },
      growthTime: '70-80 días',
      difficulty: 'Intermedio',
      benefits: ['Alta en vitamina A', 'Almacenamiento largo', 'Versátil'],
      isActive: false
    },
    {
      id: 'radish',
      name: 'Rábano',
      type: 'Raíz',
      icon: '🔴',
      description: 'Hortaliza de crecimiento ultrarrápido. Perfecta para principiantes.',
      optimalConditions: {
        tempMin: 10,
        tempMax: 18,
        humMin: 60,
        humMax: 70,
        lightMin: 55,
        lightMax: 75,
        waterMin: 65
      },
      growthTime: '20-30 días',
      difficulty: 'Fácil',
      benefits: ['Crece rapidísimo', 'Fácil cosecha', 'Sabor único'],
      isActive: false
    },
    {
      id: 'parsley',
      name: 'Perejil',
      type: 'Hierba Aromática',
      icon: '🌿',
      description: 'Hierba esencial en cocina. Rica en vitaminas y fácil de cultivar.',
      optimalConditions: {
        tempMin: 15,
        tempMax: 22,
        humMin: 55,
        humMax: 75,
        lightMin: 60,
        lightMax: 80,
        waterMin: 65
      },
      growthTime: '30-40 días',
      difficulty: 'Fácil',
      benefits: ['Rico en vitaminas', 'Uso constante', 'Resistente'],
      isActive: false
    },
    {
      id: 'arugula',
      name: 'Rúcula',
      type: 'Hoja Verde',
      icon: '🥗',
      description: 'Hoja verde picante de crecimiento rápido. Ideal para ensaladas gourmet.',
      optimalConditions: {
        tempMin: 10,
        tempMax: 20,
        humMin: 60,
        humMax: 70,
        lightMin: 55,
        lightMax: 75,
        waterMin: 65
      },
      growthTime: '25-40 días',
      difficulty: 'Fácil',
      benefits: ['Sabor distintivo', 'Crece rápido', 'Cosechas múltiples'],
      isActive: false
    },
    {
      id: 'cucumber',
      name: 'Pepino',
      type: 'Fruto',
      icon: '🥒',
      description: 'Planta trepadora refrescante. Requiere espacio y humedad constante.',
      optimalConditions: {
        tempMin: 18,
        tempMax: 28,
        humMin: 60,
        humMax: 80,
        lightMin: 70,
        lightMax: 85,
        waterMin: 80
      },
      growthTime: '50-70 días',
      difficulty: 'Intermedio',
      benefits: ['Alto contenido agua', 'Refrescante', 'Productivo'],
      isActive: false
    },
    {
      id: 'kale',
      name: 'Col Rizada',
      type: 'Hoja Verde',
      icon: '🥬',
      description: 'Superalimento resistente al frío. Excelente para smoothies y ensaladas.',
      optimalConditions: {
        tempMin: 10,
        tempMax: 20,
        humMin: 60,
        humMax: 80,
        lightMin: 60,
        lightMax: 80,
        waterMin: 70
      },
      growthTime: '55-75 días',
      difficulty: 'Fácil',
      benefits: ['Superalimento', 'Resistente', 'Alto en nutrientes'],
      isActive: false
    },
    {
      id: 'chives',
      name: 'Cebollín',
      type: 'Hierba Aromática',
      icon: '🧅',
      description: 'Hierba perenne de sabor suave. Perfecta para decorar y condimentar.',
      optimalConditions: {
        tempMin: 15,
        tempMax: 24,
        humMin: 50,
        humMax: 70,
        lightMin: 60,
        lightMax: 80,
        waterMin: 65
      },
      growthTime: '30-60 días',
      difficulty: 'Fácil',
      benefits: ['Perenne', 'Fácil mantenimiento', 'Florece bonito'],
      isActive: false
    }
  ];

  filteredPlants: Plantprofile[] = [];
  filterType: string = 'all';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadActivePlant();
    this.applyFilter('all');
  }

  loadActivePlant() {
    this.selectedPlant = this.plantProfiles.find(p => p.isActive) || null;
  }

  applyFilter(type: string) {
    this.filterType = type;
    if (type === 'all') {
      this.filteredPlants = [...this.plantProfiles];
    } else {
      this.filteredPlants = this.plantProfiles.filter(p => p.type === type);
    }
  }

  async selectPlant(plant: Plantprofile) {
    const alert = await this.alertController.create({
      header: `Seleccionar ${plant.name}`,
      message: `¿Deseas configurar ${plant.name} como tu planta activa? Los parámetros de monitoreo se ajustarán a sus condiciones óptimas.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.activatePlant(plant);
          }
        }
      ]
    });

    await alert.present();
  }

  activatePlant(plant: Plantprofile) {
    this.plantProfiles.forEach(p => p.isActive = false);
    plant.isActive = true;
    this.selectedPlant = plant;
    this.showSuccessMessage(plant.name);
  }

  async showSuccessMessage(plantName: string) {
    const alert = await this.alertController.create({
      header: '¡Éxito!',
      message: `${plantName} ha sido configurada como tu planta activa. Los parámetros de monitoreo están ajustados.`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async viewPlantDetail(plant: Plantprofile) {
    console.log('Ver detalle de:', plant.name);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Fácil': return 'success';
      case 'Intermedio': return 'warning';
      case 'Avanzado': return 'danger';
      default: return 'medium';
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  goHome() {
    this.navCtrl.navigateBack('/home');
  }
}