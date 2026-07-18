import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  NavController,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { restoreUserScopedStorageFromFirebase } from 'src/app/firebase-auth.utils';
import {
  PLANT_PROFILES,
  Plantprofile,
  TimelineEvent,
} from 'src/app/models/plants.data';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  createOutline,
  homeOutline,
  statsChartOutline,
  leafOutline,
  cameraOutline,
  flashOutline,
  imageOutline,
  refreshOutline,
  trashOutline,
  closeOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-plant',
  templateUrl: './plant.page.html',
  styleUrls: ['./plant.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class PlantPage implements OnInit {
  selectedPlant: Plantprofile | null = null;
  activePlant: Plantprofile | null = null;
  viewMode: 'progress' | 'camera' | 'photo-detail' = 'progress';
  isPlantDetailsModalOpen = false;

  flashActive = false;
  cameraFacing: 'user' | 'environment' = 'environment';
  capturedImage = '';
  progressValue = 70;
  optionalNote = '';

  plantProfiles: Plantprofile[] = [];
  private readonly plantProgressEnabled = environment.plantProgressEnabled;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private api: ApiService,
  ) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'create-outline': createOutline,
      'home-outline': homeOutline,
      'stats-chart-outline': statsChartOutline,
      'leaf-outline': leafOutline,
      'camera-outline': cameraOutline,
      'flash-outline': flashOutline,
      'image-outline': imageOutline,
      'refresh-outline': refreshOutline,
      'trash-outline': trashOutline,
      'close-outline': closeOutline,
      'chevron-forward-outline': chevronForwardOutline,
    });
  }

  async ngOnInit() {
    this.plantProfiles = JSON.parse(JSON.stringify(PLANT_PROFILES));
    await this.initializePage();

    if (!this.activePlant) {
      this.router.navigate(['/select']);
    }
  }

  async ionViewWillEnter() {
    await this.refreshPageState();
  }

  private async initializePage() {
    await restoreUserScopedStorageFromFirebase();
    await this.loadActivePlant();
  }

  private async refreshPageState() {
    await restoreUserScopedStorageFromFirebase();
    await this.loadActivePlant();
  }

  async loadActivePlant() {
    const savedPlantId = localStorage.getItem('activePlantId');

    if (savedPlantId) {
      const savedPlant = this.plantProfiles.find((plant) => plant.id === savedPlantId);
      if (savedPlant) {
        this.plantProfiles.forEach((plant) => (plant.isActive = false));
        savedPlant.isActive = true;
        this.selectedPlant = savedPlant;
        this.activePlant = savedPlant;
      }
    }

    const boxId = localStorage.getItem('selectedBoxId');
    if (boxId) {
      try {
        const boxInfo = await this.api.getBoxInfo(boxId);
        const plantObj =
          boxInfo && boxInfo.box ? boxInfo.box.plant : boxInfo ? boxInfo.plant : null;

        if (plantObj) {
          const plantId =
            plantObj.id || (boxInfo.box ? boxInfo.box.plantId : boxInfo.plantId);

          if (plantId) {
            const matchedPlant = this.plantProfiles.find((plant) => plant.id === plantId);

            if (matchedPlant) {
              this.plantProfiles.forEach((plant) => (plant.isActive = false));
              matchedPlant.isActive = true;
              this.selectedPlant = matchedPlant;
              this.activePlant = matchedPlant;
              localStorage.setItem('activePlantId', plantId);

              if (this.plantProgressEnabled) {
                await this.loadProgressTimeline(boxId);
              } else if (!this.activePlant.timeline || this.activePlant.timeline.length === 0) {
                this.activePlant.timeline = this.getDefaultTimeline();
              }

              localStorage.setItem('activePlant', JSON.stringify(this.activePlant));

              const currentEmail = localStorage.getItem('currentUserEmail');
              if (currentEmail) {
                localStorage.setItem(`activePlantId_${currentEmail}`, plantId);
                localStorage.setItem(
                  `activePlant_${currentEmail}`,
                  JSON.stringify(this.activePlant),
                );
              }
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Error loading active plant details from backend:', err);
      }
    }

    this.activePlant = this.plantProfiles.find((plant) => plant.isActive) || null;
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
          id: item.id,
        }));

        if (this.activePlant) {
          this.activePlant.timeline = backendTimeline;
        }
      } else if (
        this.activePlant &&
        (!this.activePlant.timeline || this.activePlant.timeline.length === 0)
      ) {
        this.activePlant.timeline = this.getDefaultTimeline();
      }
    } catch (err) {
      if (
        this.activePlant &&
        (!this.activePlant.timeline || this.activePlant.timeline.length === 0)
      ) {
        this.activePlant.timeline = this.getDefaultTimeline();
      }

      if ((err as { status?: number })?.status !== 404) {
        console.warn('Error loading progress timeline from backend:', err);
      }
    }
  }

  openPlantDetailsModal() {
    this.isPlantDetailsModalOpen = true;
  }

  closePlantDetailsModal() {
    this.isPlantDetailsModalOpen = false;
  }

  async deleteProgress(progressId: number, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Confirmar eliminacion',
      message: 'Estas segura de que deseas eliminar esta foto de progreso?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.api.deletePlantProgress(progressId);

              const boxId = localStorage.getItem('selectedBoxId');
              if (boxId) {
                await this.loadProgressTimeline(boxId);
              }

              if (this.activePlant) {
                localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
                const currentEmail = localStorage.getItem('currentUserEmail');
                if (currentEmail) {
                  localStorage.setItem(
                    `activePlant_${currentEmail}`,
                    JSON.stringify(this.activePlant),
                  );
                }
              }

              const toast = await this.toastController.create({
                message: 'Foto de progreso eliminada',
                duration: 2000,
                color: 'success',
                position: 'top',
              });
              await toast.present();
            } catch (err) {
              console.error('Error deleting progress:', err);
              const toast = await this.toastController.create({
                message: 'Error al eliminar el progreso',
                duration: 2000,
                color: 'danger',
                position: 'top',
              });
              await toast.present();
            }
          },
        },
      ],
    });

    await alert.present();
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
      familia: plant.type === 'Hierba Aromatica' ? 'Lamiaceae' : 'Asteraceae',
      genero: plant.name.split(' ')[0],
      especie: plant.name.toLowerCase().replace(' ', '_'),
    };
  }

  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop';
    }

    if (imageUrl.startsWith('session://')) {
      const key = imageUrl.replace('session://', '');
      const stored = sessionStorage.getItem(key);
      return (
        stored ||
        this.activePlant?.imageUrl ||
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop'
      );
    }

    return imageUrl;
  }

  getDefaultTimeline(): TimelineEvent[] {
    return [
      {
        date: 'Hoy, 20 Mayo 2026',
        description: 'La planta se ve saludable',
        imageUrl:
          this.activePlant?.imageUrl ||
          'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop',
      },
      {
        date: 'Hoy, 13 Enero 2026',
        description: 'Nuevas hojas en crecimiento',
        imageUrl:
          'https://images.unsplash.com/photo-1604762524889-3e2fec45568f?q=80&w=200&auto=format&fit=crop',
      },
      {
        date: '15 Diciembre 2025',
        description: 'Inicio de la Planta',
        imageUrl:
          'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=200&auto=format&fit=crop',
      },
    ];
  }

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
    this.capturedImage =
      this.activePlant?.imageUrl ||
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=500&auto=format&fit=crop';
    this.viewMode = 'photo-detail';
  }

  selectFromGallery() {
    this.capturedImage =
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500&auto=format&fit=crop';
    this.viewMode = 'photo-detail';
  }

  deleteCapturedPhoto() {
    this.capturedImage = '';
    this.viewMode = 'camera';
  }

  async savePhotoDetail() {
    const todayStr = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (this.activePlant) {
      if (!this.activePlant.timeline) {
        this.activePlant.timeline = this.getDefaultTimeline();
      }

      this.activePlant.timeline.unshift({
        date: `Hoy, ${todayStr}`,
        description: this.optionalNote || 'La planta se ve saludable',
        imageUrl: this.capturedImage || this.activePlant.imageUrl,
        progress: this.progressValue,
      });

      localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
      const currentEmail = localStorage.getItem('currentUserEmail');
      if (currentEmail) {
        localStorage.setItem(
          `activePlant_${currentEmail}`,
          JSON.stringify(this.activePlant),
        );
      }

      const toast = await this.toastController.create({
        message: 'Foto y notas guardadas exitosamente',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
      await toast.present();
    }

    this.viewMode = 'progress';
  }

  async editPlantDetails() {
    if (!this.activePlant) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Editar detalles',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre o apodo de la planta',
          value: this.activePlant.name,
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripcion o notas...',
          value: this.activePlant.description,
        },
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
              const currentEmail = localStorage.getItem('currentUserEmail');
              if (currentEmail) {
                localStorage.setItem(
                  `activePlant_${currentEmail}`,
                  JSON.stringify(this.activePlant),
                );
              }

              if (this.selectedPlant && this.selectedPlant.id === this.activePlant.id) {
                this.selectedPlant.name = data.name;
                this.selectedPlant.description = data.description;
              }
            }
          },
        },
      ],
    });

    await alert.present();
  }

  getDifficultyColor(difficulty: 'Fácil' | 'Intermedio' | 'Avanzado'): string {
    switch (difficulty) {
      case 'Fácil':
        return 'success';
      case 'Intermedio':
        return 'warning';
      case 'Avanzado':
        return 'danger';
      default:
        return 'medium';
    }
  }

  goBack() {
    if (this.viewMode === 'camera' && this.activePlant) {
      this.viewMode = 'progress';
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
    this.router.navigate(['/history']);
  }

  goProfile(): void {
    this.router.navigate(['/perfil']);
  }
}
