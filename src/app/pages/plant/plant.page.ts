import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { PLANT_PROFILES, Plantprofile, TimelineEvent } from 'src/app/models/plants.data';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  createOutline,
  homeOutline,
  statsChartOutline,
  leafOutline,
  timeOutline,
  cameraOutline,
  flashOutline,
  imageOutline,
  refreshOutline,
  trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-plant',
  templateUrl: './plant.page.html',
  styleUrls: ['./plant.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PlantPage implements OnInit {

  selectedPlant: Plantprofile | null = null;
  activePlant: Plantprofile | null = null;
  viewMode: 'detail' | 'camera' | 'photo-detail' = 'detail';
  detailSubMode: 'info' | 'progress' = 'info';

  // Camera flow variables
  flashActive = false;
  cameraFacing: 'user' | 'environment' = 'environment';
  capturedImage = '';
  progressValue = 70;
  optionalNote = '';

  plantProfiles: Plantprofile[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private api: ApiService,
    private route: ActivatedRoute
  ) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'create-outline': createOutline,
      'home-outline': homeOutline,
      'stats-chart-outline': statsChartOutline,
      'leaf-outline': leafOutline,
      'time-outline': timeOutline,
      'camera-outline': cameraOutline,
      'flash-outline': flashOutline,
      'image-outline': imageOutline,
      'refresh-outline': refreshOutline,
      'trash-outline': trashOutline
    });
  }

  async ngOnInit() {
    this.plantProfiles = JSON.parse(JSON.stringify(PLANT_PROFILES));
    await this.loadActivePlant();

    // Si no hay planta activa, redirigir directamente a la pantalla de selección
    if (!this.activePlant) {
      this.router.navigate(['/select-plant']);
    }
  }

  async ionViewWillEnter() {
    await this.loadActivePlant();
    if (!this.activePlant) {
      this.router.navigate(['/select-plant']);
    }
  }

  async loadActivePlant() {
    const boxId = localStorage.getItem('selectedBoxId');

    if (boxId) {
      try {
        const boxInfo = await this.api.getBoxInfo(boxId);
        if (boxInfo && boxInfo.box && boxInfo.box.plant) {
          const plantId = boxInfo.box.plant.id;
          if (plantId) {
            const savedPlant = this.plantProfiles.find(p => p.id === plantId || String(p.id) === String(plantId));
            if (savedPlant) {
              this.plantProfiles.forEach(p => p.isActive = false);
              savedPlant.isActive = true;
              this.selectedPlant = savedPlant;
              this.activePlant = savedPlant;
              localStorage.setItem('activePlantId', plantId);

              // Cargar historial real desde el backend
              await this.loadProgressTimeline(boxId);

              localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Error loading active plant details from backend:', err);
      }
    }

    const savedPlantId = localStorage.getItem('activePlantId');
    if (savedPlantId) {
      const savedPlant = this.plantProfiles.find(p => p.id === savedPlantId);
      if (savedPlant) {
        this.plantProfiles.forEach(p => p.isActive = false);
        savedPlant.isActive = true;
        this.selectedPlant = savedPlant;
        this.activePlant = savedPlant;

        // También intenta cargar progreso desde backend en modo local
        if (boxId) {
          await this.loadProgressTimeline(boxId);
        }
        return;
      }
    }

    this.activePlant = this.plantProfiles.find(p => p.isActive) || null;
    this.selectedPlant = this.activePlant;
  }

  async loadProgressTimeline(boxId: string) {
    try {
      const progressList = await this.api.getPlantProgress(boxId);
      if (progressList && progressList.length > 0) {
        const backendTimeline: TimelineEvent[] = progressList.map((item: any) => ({
          date: item.date,
          description: item.description,
          imageUrl: item.imageUrl,
          progress: item.progress,
          id: item.id
        }));
        if (this.activePlant) {
          this.activePlant.timeline = backendTimeline;
        }
      } else if (this.activePlant && (!this.activePlant.timeline || this.activePlant.timeline.length === 0)) {
        // Si no hay datos en backend, cargar timeline por defecto
        this.activePlant.timeline = this.getDefaultTimeline();
      }
    } catch (err) {
      console.warn('Error loading progress timeline from backend:', err);
    }
  }

  async deleteProgress(progressId: number, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás segura de que deseas eliminar esta foto de progreso?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.api.deletePlantProgress(progressId);
              
              // Recargar timeline
              const boxId = localStorage.getItem('selectedBoxId');
              if (boxId) {
                await this.loadProgressTimeline(boxId);
              }
              
              // Actualizar localStorage
              if (this.activePlant) {
                localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
              }
              
              const toast = await this.toastController.create({
                message: '✅ Foto de progreso eliminada',
                duration: 2000,
                color: 'success',
                position: 'top'
              });
              await toast.present();
            } catch (err) {
              console.error('Error deleting progress:', err);
              const toast = await this.toastController.create({
                message: '❌ Error al eliminar el progreso',
                duration: 2000,
                color: 'danger',
                position: 'top'
              });
              await toast.present();
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  setDetailSubMode(mode: 'info' | 'progress') {
    this.detailSubMode = mode;
  }

  getTaxonomy(plant: Plantprofile) {
    if (plant.taxonomy) {
      return plant.taxonomy;
    }
    return {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: plant.type === 'Fruto' ? 'Rosales' : 'Lamiales',
      familia: plant.type === 'Hierba Aromática' ? 'Lamiaceae' : 'Asteraceae',
      genero: plant.name.split(' ')[0],
      especie: plant.name.toLowerCase().replace(' ', '_')
    };
  }

  /** Resolve session:// references saved by camera.page into real base64 data URLs */
  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop';
    if (imageUrl.startsWith('session://')) {
      const key = imageUrl.replace('session://', '');
      const stored = sessionStorage.getItem(key);
      return stored || (this.activePlant?.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop');
    }
    return imageUrl;
  }

  getDefaultTimeline(): TimelineEvent[] {
    return [
      {
        date: 'Hoy, 20 Mayo 2026',
        description: 'La planta se ve saludable',
        imageUrl: this.activePlant?.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop'
      },
      {
        date: 'Hoy, 13 Enero 2026',
        description: 'Nuevas hojas en crecimiento',
        imageUrl: 'https://images.unsplash.com/photo-1604762524889-3e2fec45568f?q=80&w=200&auto=format&fit=crop'
      },
      {
        date: '15 Diciembre 2025',
        description: 'Inicio de la Planta',
        imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=200&auto=format&fit=crop'
      }
    ];
  }

  // Camera Actions
  openCamera() {
    this.router.navigate(['/camera']);
  }

  toggleFlash() {
    this.flashActive = !this.flashActive;
  }

  switchCamera() {
    this.cameraFacing = this.cameraFacing === 'environment' ? 'user' : 'environment';
  }

  triggerShutter() {
    // Tomar la foto simulada usando la imagen de la planta activa
    this.capturedImage = this.activePlant?.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=500&auto=format&fit=crop';
    this.viewMode = 'photo-detail';
  }

  selectFromGallery() {
    // Simular selección de foto alternativa de alta calidad de la galería
    this.capturedImage = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500&auto=format&fit=crop';
    this.viewMode = 'photo-detail';
  }

  deleteCapturedPhoto() {
    this.capturedImage = '';
    this.viewMode = 'camera';
  }

  async savePhotoDetail() {
    const todayStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    
    if (this.activePlant) {
      if (!this.activePlant.timeline) {
        this.activePlant.timeline = this.getDefaultTimeline();
      }
      
      this.activePlant.timeline.unshift({
        date: `Hoy, ${todayStr}`,
        description: this.optionalNote || 'La planta se ve saludable',
        imageUrl: this.capturedImage || this.activePlant.imageUrl,
        progress: this.progressValue
      });

      // Persistir en localstorage
      localStorage.setItem('activePlant', JSON.stringify(this.activePlant));

      const toast = await this.toastController.create({
        message: '¡Foto y notas guardadas exitosamente!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }

    this.viewMode = 'detail';
    this.detailSubMode = 'progress';
  }

  async editPlantDetails() {
    if (!this.activePlant) return;

    const alert = await this.alertController.create({
      header: 'Editar Detalles',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre o Apodo de la planta',
          value: this.activePlant.name
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción o notas...',
          value: this.activePlant.description
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.name && this.activePlant) {
              this.activePlant.name = data.name;
              this.activePlant.description = data.description;
              
              localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
              
              if (this.selectedPlant && this.selectedPlant.id === this.activePlant.id) {
                this.selectedPlant.name = data.name;
                this.selectedPlant.description = data.description;
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getDifficultyColor(difficulty: 'Fácil' | 'Intermedio' | 'Avanzado'): string {
    switch (difficulty) {
      case 'Fácil': return 'success';
      case 'Intermedio': return 'warning';
      case 'Avanzado': return 'danger';
      default: return 'medium';
    }
  }

  goBack() {
    if (this.viewMode === 'camera' && this.activePlant) {
      this.viewMode = 'detail';
    } else if (this.viewMode === 'photo-detail') {
      this.viewMode = 'camera';
    } else {
      this.router.navigate(['/home']);
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goStats(): void {
    this.router.navigate(['/weekly']);
  }

  goHistory(): void {
    this.router.navigate(['/notification']);
  }
}
