import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonFooter
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService, mapBackendPlantToProfile } from 'src/app/api.service';
import { restoreUserScopedStorageFromFirebase } from 'src/app/firebase-auth.utils';
import { SocketService } from 'src/app/socket.service';
import { PLANT_PROFILES, Plantprofile } from 'src/app/models/plants.data';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  checkmarkCircle,
  alertCircleOutline,
  thermometerOutline,
  waterOutline,
  homeOutline,
  statsChartOutline,
  leafOutline,
  timeOutline,
  addCircleOutline,
  personOutline,
  closeOutline,
  cameraOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-select-plant',
  templateUrl: './select-plant.page.html',
  styleUrls: ['./select-plant.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonFooter
  ]
})
export class SelectPlantPage implements OnInit {

  plantProfiles: Plantprofile[] = [];
  filteredPlants: Plantprofile[] = [];
  selectedPlant: Plantprofile | null = null;
  filterType: string = 'all';
  activatingPlantId: string | null = null;
  selectionMessage = '';
  isAddModalOpen = false;
  newPlant = { name: '', type: 'Hierba Aromática', tempMax: 25, humMax: 70 };
  newPlantImage: string | null = null;
  nameError = '';
  imageError = '';

  constructor(
    private router: Router,
    private api: ApiService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      chevronBackOutline,
      checkmarkCircle,
      alertCircleOutline,
      thermometerOutline,
      waterOutline,
      homeOutline,
      statsChartOutline,
      leafOutline,
      timeOutline,
      addCircleOutline,
      'person-outline': personOutline,
      closeOutline,
      cameraOutline
    });
  }

  async ngOnInit() {
    this.plantProfiles = JSON.parse(JSON.stringify(PLANT_PROFILES));
    this.loadCustomPlants();
    await this.initializePage();
  }

  async ionViewWillEnter() {
    this.loadCategoryFilter();
    await this.refreshPageState();
  }

  private loadCategoryFilter() {
    const category = localStorage.getItem('selectedCategoryFilter');
    if (category) {
      let filterToApply = 'all';
      if (category === 'medicinal') {
        filterToApply = 'Hierba Aromatica';
      } else if (category === 'frutal') {
        filterToApply = 'Fruto';
      } else if (category === 'vegetal') {
        filterToApply = 'Hoja Verde';
      } else if (category === 'hortaliza') {
        // En los perfiles de planta, cebollín/zanahoria/rábano son 'Raíz' o 'Hierba Aromática'
        filterToApply = 'Raíz';
      }
      this.applyFilter(filterToApply);
      localStorage.removeItem('selectedCategoryFilter'); // Consumimos el filtro de un solo uso
    } else {
      this.applyFilter('all');
    }
  }

  private async initializePage() {
    await restoreUserScopedStorageFromFirebase();
    await this.api.ensureSelectedBox();
    await this.loadActivePlant();
  }

  private async refreshPageState() {
    await restoreUserScopedStorageFromFirebase();
    await this.api.ensureSelectedBox();
    await this.loadActivePlant();
  }

  async loadActivePlant() {
    const savedPlantId = localStorage.getItem('activePlantId');
    if (savedPlantId) {
      const savedPlant = this.plantProfiles.find(p => p.id === savedPlantId);
      if (savedPlant) {
        this.plantProfiles.forEach(p => p.isActive = false);
        savedPlant.isActive = true;
        this.selectedPlant = savedPlant;
      }
    }

    const boxId = await this.api.ensureSelectedBox();
    if (boxId) {
      try {
        const boxInfo = await this.api.getBoxInfo(boxId);
        if (boxInfo?.box?.plant) {
          const plantId = boxInfo.box.plant.id;
          if (plantId) {
            const savedPlant = this.plantProfiles.find(p => p.id === plantId || String(p.id) === String(plantId));
            if (savedPlant) {
              this.plantProfiles.forEach(p => p.isActive = false);
              savedPlant.isActive = true;
              this.selectedPlant = savedPlant;
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Error loading active plant details in select-plant:', err);
      }
    }

    if (!savedPlantId) {
      this.selectedPlant = null;
    }
  }

  applyFilter(type: string) {
    this.filterType = type;
    if (type === 'all') {
      this.filteredPlants = this.plantProfiles;
    } else {
      this.filteredPlants = this.plantProfiles.filter(
        p => this.normalizeText(p.type) === this.normalizeText(type)
      );
    }
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private applyPlantSelectionLocally(plant: Plantprofile) {
    this.plantProfiles.forEach(p => p.isActive = false);
    plant.isActive = true;
    this.selectedPlant = plant;

    localStorage.setItem('activePlantId', plant.id);
    localStorage.setItem('activePlant', JSON.stringify(plant));

    const currentEmail = localStorage.getItem('currentUserEmail');
    if (currentEmail) {
      localStorage.setItem('activePlantId_' + currentEmail, plant.id);
      localStorage.setItem('activePlant_' + currentEmail, JSON.stringify(plant));
    }
  }

  private async updatePlantWithTimeout(boxId: string, plantId: string, timeoutMs: number = 6000) {
    return await Promise.race([
      this.api.updateBoxPlant(boxId, plantId),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), timeoutMs);
      }),
    ]);
  }

  async selectPlant(plant: Plantprofile) {
    if (this.activatingPlantId) {
      return;
    }

    this.selectionMessage = '';
    this.activatingPlantId = plant.id;

    await restoreUserScopedStorageFromFirebase();

    const boxId = await this.api.ensureSelectedBox();
    if (!boxId) {
      this.selectionMessage = 'No pudimos identificar tu GreenBox. Ingresa nuevamente con tu codigo.';
      this.activatingPlantId = null;
      return;
    }

    try {
      this.applyPlantSelectionLocally(plant);
      const response: any = await this.updatePlantWithTimeout(boxId, plant.id);

      if (response?.data?.id) {
        const oldUserPlantId = localStorage.getItem('activeUserPlantId');
        if (oldUserPlantId) {
          this.socketService.leavePlant(Number(oldUserPlantId));
        }
        localStorage.setItem('activeUserPlantId', String(response.data.id));
        this.socketService.joinPlant(response.data.id);
      }

      if (response?.data?.plant) {
        const mappedPlant = mapBackendPlantToProfile(response.data.plant);
        localStorage.setItem('activePlant', JSON.stringify(mappedPlant));
        const currentEmail = localStorage.getItem('currentUserEmail');
        if (currentEmail) {
          localStorage.setItem('activePlant_' + currentEmail, JSON.stringify(mappedPlant));
        }
      }
    } catch (error: any) {
      console.warn('Error al actualizar la planta en el backend, usando activacion local:', error);
      this.applyPlantSelectionLocally(plant);
      this.selectionMessage = 'Se activo la planta localmente mientras responde el servidor.';
    } finally {
      this.activatingPlantId = null;
    }

    this.router.navigate(['/home']);
  }

  goBack() {
    this.router.navigate(['/select']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goStats() {
    this.router.navigate(['/weekly']);
  }

  goHistory() {
    this.router.navigate(['/history']);
  }

  goProfile() {
    this.router.navigate(['/perfil']);
  }

  getCategoryLabel(): string {
    if (this.filterType === 'Hierba Aromatica') return 'Medicinales';
    if (this.filterType === 'Fruto') return 'Frutales';
    if (this.filterType === 'Hoja Verde') return 'Vegetales';
    if (this.filterType === 'Raíz') return 'Hortalizas';
    return 'Todas las plantas';
  }

  loadCustomPlants() {
    const customPlantsRaw = localStorage.getItem('customPlants');
    if (customPlantsRaw) {
      try {
        const customPlants: Plantprofile[] = JSON.parse(customPlantsRaw);
        this.plantProfiles.push(...customPlants);
      } catch (e) {
        console.warn('Error loading custom plants from localStorage:', e);
      }
    }
  }

  // Valores recomendados por categoría
  private readonly categoryDefaults: { [key: string]: { tempMax: number; humMax: number } } = {
    'Hierba Aromática': { tempMax: 28, humMax: 70 },
    'Fruto':            { tempMax: 30, humMax: 80 },
    'Hoja Verde':       { tempMax: 25, humMax: 75 },
    'Raíz':             { tempMax: 22, humMax: 65 },
  };

  openAddPlantModal() {
    const defaults = this.categoryDefaults['Hierba Aromática'];
    this.newPlant = {
      name: '',
      type: 'Hierba Aromática',
      tempMax: defaults.tempMax,
      humMax: defaults.humMax
    };
    this.newPlantImage = null;
    this.nameError = '';
    this.imageError = '';
    this.savePlantError = '';
    this.isAddModalOpen = true;
    this.cdr.detectChanges();
  }

  onNameInput() {
    this.checkAndClearErrors();
  }

  checkAndClearErrors() {
    const hasName = this.newPlant.name && this.newPlant.name.trim();
    const hasImage = !!this.newPlantImage;
    if (hasName && hasImage) {
      this.nameError = '';
      this.imageError = '';
      this.cdr.detectChanges();
    }
  }

  onCategoryChange() {
    const defaults = this.categoryDefaults[this.newPlant.type];
    if (defaults) {
      this.newPlant.tempMax = defaults.tempMax;
      this.newPlant.humMax  = defaults.humMax;
      this.cdr.detectChanges();
    }
  }

  closeAddPlantModal() {
    this.isAddModalOpen = false;
    this.nameError = '';
    this.imageError = '';
    this.savePlantError = '';
    this.cdr.detectChanges();
  }

  onPhotoSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Crear un canvas para redimensionar la imagen a un tamaño óptimo
          const canvas = document.createElement('canvas');
          const max_size = 400; // Ancho/alto máximo para no saturar el localStorage
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Comprimir como JPEG al 70% de calidad para optimizar espacio (aproximadamente 15KB - 30KB)
            this.newPlantImage = canvas.toDataURL('image/jpeg', 0.7);
          } else {
            this.newPlantImage = reader.result as string;
          }
          this.checkAndClearErrors();
          this.cdr.detectChanges();
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  isSavingPlant = false;
  savePlantError = '';

  async saveNewPlant() {
    const hasName = this.newPlant.name && this.newPlant.name.trim();
    const hasImage = !!this.newPlantImage;

    this.nameError = hasName ? '' : 'Por favor, ingresa el nombre de la planta.';
    this.imageError = hasImage ? '' : 'Por favor, sube una foto para la planta.';

    if (!hasName || !hasImage) {
      this.cdr.detectChanges();
      return;
    }

    this.isSavingPlant = true;
    this.savePlantError = '';
    this.cdr.detectChanges();

    // Mapeo de tipo del form a categoría del backend
    const categoryMap: { [key: string]: string } = {
      'Hierba Aromática': 'interior',
      'Fruto': 'comestible',
      'Hoja Verde': 'comestible',
      'Raíz': 'comestible',
    };
    const category = categoryMap[this.newPlant.type] || 'interior';

    // Datos para el backend
    const plantPayload = {
      name: this.newPlant.name.trim(),
      category,
      imageUrl: undefined as string | undefined,
      minTemperature: 15,
      maxTemperature: this.newPlant.tempMax || 25,
      minHumidity: 45,
      maxHumidity: this.newPlant.humMax || 70,
      lightHours: 8,
      minWaterLevel: 50,
      wateringFrequency: 3,
    };

    let backendId: string = 'custom_' + Date.now();
    let savedToBackend = false;

    try {
      const response: any = await this.api.createPlant(plantPayload);
      const createdPlant = response?.data ?? response;
      if (createdPlant?.id) {
        backendId = String(createdPlant.id);
        savedToBackend = true;
      }
    } catch (err) {
      console.warn('No se pudo guardar en el backend, se guardará solo localmente:', err);
      this.savePlantError = 'La planta se guardó localmente (sin conexión al servidor).';
    }

    // Construir el perfil de planta para el frontend
    const icon = this.newPlant.type === 'Fruto' ? '🍓'
      : this.newPlant.type === 'Hoja Verde' ? '🥬'
      : this.newPlant.type === 'Raíz' ? '🥕'
      : '🌿';

    const createdPlant: any = {
      id: backendId,
      name: this.newPlant.name.trim(),
      type: this.newPlant.type,
      icon,
      imageUrl: this.newPlantImage
        || 'https://images.unsplash.com/photo-1530652101053-8c0db4fbb5de?q=80&w=500&auto=format&fit=crop',
      optimalConditions: {
        tempMin: 15,
        tempMax: this.newPlant.tempMax || 25,
        humMin: 45,
        humMax: this.newPlant.humMax || 70,
        lightMin: 50,
        lightMax: 80,
        waterMin: 50
      },
      growthTime: '30-40 días',
      difficulty: 'Fácil',
      benefits: ['SALUDABLE', 'PERSONALIZADO'],
      isActive: false,
      description: 'Planta personalizada agregada por el usuario.',
      isCustom: true,
      savedToBackend,
    };

    // Agregar a la lista en pantalla
    this.plantProfiles.push(createdPlant);

    // Guardar también en localStorage como respaldo offline
    const customPlantsRaw = localStorage.getItem('customPlants');
    let customPlants: any[] = [];
    try {
      customPlants = customPlantsRaw ? JSON.parse(customPlantsRaw) : [];
    } catch (e) {}
    customPlants.push(createdPlant);
    localStorage.setItem('customPlants', JSON.stringify(customPlants));

    this.isSavingPlant = false;
    this.applyFilter(this.filterType);
    this.closeAddPlantModal();
    this.cdr.detectChanges();
  }
}

