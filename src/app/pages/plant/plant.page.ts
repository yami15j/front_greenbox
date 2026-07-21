import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  NavController,
  AlertController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { restoreUserScopedStorageFromFirebase } from 'src/app/firebase-auth.utils';
import {
  PLANT_PROFILES,
  Plantprofile,
  TimelineEvent,
  TimelineAiAnalysis,
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
  sparklesOutline,
  checkmarkCircleOutline,
  timeOutline,
  addOutline,
  ellipsisHorizontalOutline,
  calendarOutline,
  saveOutline,
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
  viewMode: 'progress' | 'camera' | 'photo-detail' | 'record-detail' = 'progress';
  isPlantDetailsModalOpen = false;

  flashActive = false;
  cameraFacing: 'user' | 'environment' = 'environment';
  capturedImage = '';
  progressValue = 70;
  optionalNote = '';

  plantProfiles: Plantprofile[] = [];
  private readonly plantProgressEnabled = environment.plantProgressEnabled;

  // ── Record detail view state ──
  selectedEvent: TimelineEvent | null = null;
  selectedEventNote = '';
  isAnalyzing = false;
  aiAnalysis: TimelineAiAnalysis | null = null;
  showAiAnalysis = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
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
      'sparkles-outline': sparklesOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'time-outline': timeOutline,
      'add-outline': addOutline,
      'ellipsis-horizontal-outline': ellipsisHorizontalOutline,
      'calendar-outline': calendarOutline,
      'save-outline': saveOutline,
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
    this.mergeCustomTimelineEvents();
  }

  private async refreshPageState() {
    await restoreUserScopedStorageFromFirebase();
    await this.loadActivePlant();

    // Restaurar eventos custom guardados previamente (sobreviven navegación)
    this.mergeCustomTimelineEvents();

    // Inyectar evento pendiente guardado por la cámara
    const pendingStr = localStorage.getItem('pendingTimelineEvent');
    if (pendingStr && this.activePlant) {
      try {
        const pending = JSON.parse(pendingStr);
        if (!this.activePlant.timeline) {
          this.activePlant.timeline = [];
        }
        const isDuplicate = this.activePlant.timeline.some(
          (e: any) => e.registeredAt === pending.registeredAt
        );
        if (!isDuplicate) {
          this.activePlant.timeline.unshift(pending);
          // Persistir para que sobreviva futuras navegaciones
          this.saveCustomTimelineEvent(pending);
        }
      } catch (e) {
        console.warn('Error parsing pending timeline event', e);
      }
      localStorage.removeItem('pendingTimelineEvent');
    }
  }

  /** Guarda un evento custom en localStorage (clave por planta) */
  private saveCustomTimelineEvent(event: any) {
    try {
      const plantId = this.activePlant?.id || localStorage.getItem('activePlantId') || 'default';
      const key = `customTimelineEvents_${plantId}`;
      const existing: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      const isDup = existing.some((e: any) => e.registeredAt === event.registeredAt);
      if (!isDup) {
        existing.unshift(event);
        // Máximo 30 eventos custom guardados
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 30)));
      }
    } catch (e) {
      console.warn('No se pudo persistir el evento custom:', e);
    }
  }

  /** Fusiona eventos custom guardados de vuelta al timeline activo */
  private mergeCustomTimelineEvents() {
    if (!this.activePlant) return;
    try {
      const plantId = this.activePlant.id || localStorage.getItem('activePlantId') || 'default';
      const key = `customTimelineEvents_${plantId}`;
      const customEvents: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (customEvents.length === 0) return;

      if (!this.activePlant.timeline) {
        this.activePlant.timeline = [];
      }

      for (const ev of customEvents) {
        const exists = this.activePlant.timeline.some(
          (e: any) => e.registeredAt === ev.registeredAt
        );
        if (!exists) {
          this.activePlant.timeline.unshift(ev);
        }
      }

      // Ordenar por fecha descendente
      this.activePlant.timeline.sort((a: any, b: any) =>
        new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime()
      );
    } catch (e) {
      console.warn('No se pudieron fusionar los eventos custom:', e);
    }
  }

  async loadActivePlant() {
    // 1. Carga inicial rápida desde caché para UX
    const activePlantStr = localStorage.getItem('activePlant');
    if (activePlantStr) {
      try {
        const savedPlant = JSON.parse(activePlantStr);
        this.selectedPlant = savedPlant;
        this.activePlant = savedPlant;
      } catch (e) {
        console.warn('Error parsing activePlant', e);
      }
    }

    // 2. Sincronización real con el backend
    const boxId = localStorage.getItem('selectedBoxId');
    if (boxId) {
      try {
        const boxInfo = await this.api.getBoxInfo(boxId);
        const plantObj =
          boxInfo && boxInfo.box ? boxInfo.box.plant : boxInfo ? boxInfo.plant : null;

        if (plantObj) {
          // Usamos directamente la planta devuelta por el backend (ya mapeada)
          // sin depender del arreglo local PLANT_PROFILES
          this.selectedPlant = plantObj;
          this.activePlant = plantObj;
          localStorage.setItem('activePlantId', String(plantObj.id));

          if (this.plantProgressEnabled) {
            await this.loadProgressTimeline(boxId);
          } else if (!this.activePlant!.timeline || this.activePlant!.timeline.length === 0) {
            this.activePlant!.timeline = this.getDefaultTimeline();
          }

          localStorage.setItem('activePlant', JSON.stringify(this.activePlant));

          const currentEmail = localStorage.getItem('currentUserEmail');
          if (currentEmail) {
            localStorage.setItem(`activePlantId_${currentEmail}`, String(plantObj.id));
            localStorage.setItem(
              `activePlant_${currentEmail}`,
              JSON.stringify(this.activePlant),
            );
          }
          return;
        }
      } catch (err) {
        console.warn('Error loading active plant details from backend:', err);
      }
    }

    // Fallback final
    if (!this.activePlant) {
      this.activePlant = null;
      this.selectedPlant = null;
    }
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
          registeredAt: item.createdAt || item.date,
          aiAnalysis: item.aiAnalysis || null,
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

  // ── Record detail view ──

  openRecordDetail(ev: TimelineEvent) {
    this.selectedEvent = ev;
    this.selectedEventNote = ev.description || '';
    this.aiAnalysis = ev.aiAnalysis || null;
    this.showAiAnalysis = !!ev.aiAnalysis;
    this.viewMode = 'record-detail';
  }

  closeRecordDetail() {
    this.selectedEvent = null;
    this.aiAnalysis = null;
    this.showAiAnalysis = false;
    this.viewMode = 'progress';
  }

  async presentRecordOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones de registro',
      buttons: [
        {
          text: 'Eliminar registro',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.confirmDeleteRecord();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async confirmDeleteRecord() {
    const alert = await this.alertController.create({
      header: '¿Eliminar registro?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteCurrentRecord();
          }
        }
      ]
    });
    await alert.present();
  }

  deleteCurrentRecord() {
    if (!this.activePlant || !this.selectedEvent) return;

    // Remove from activePlant timeline
    if (this.activePlant.timeline) {
      this.activePlant.timeline = this.activePlant.timeline.filter(e => e.registeredAt !== this.selectedEvent!.registeredAt);
    }

    // Update local storage for custom timeline events
    const plantId = this.activePlant.id || localStorage.getItem('activePlantId') || 'default';
    const key = `customTimelineEvents_${plantId}`;
    let customEvents: any[] = JSON.parse(localStorage.getItem(key) || '[]');
    customEvents = customEvents.filter(e => e.registeredAt !== this.selectedEvent!.registeredAt);
    localStorage.setItem(key, JSON.stringify(customEvents));

    // Also update activePlant in storage if needed
    localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
    const currentEmail = localStorage.getItem('currentUserEmail');
    if (currentEmail) {
      localStorage.setItem(`activePlant_${currentEmail}`, JSON.stringify(this.activePlant));
    }

    this.closeRecordDetail();
  }

  updateCurrentRecord() {
    if (!this.activePlant || !this.selectedEvent) return;
    const plantId = this.activePlant.id || localStorage.getItem('activePlantId') || 'default';
    const key = `customTimelineEvents_${plantId}`;
    let customEvents: any[] = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = customEvents.findIndex(e => e.registeredAt === this.selectedEvent!.registeredAt);
    if (idx !== -1) {
      customEvents[idx] = this.selectedEvent;
      localStorage.setItem(key, JSON.stringify(customEvents));
    }

    // update activePlant timeline
    if (this.activePlant.timeline) {
      const tlIdx = this.activePlant.timeline.findIndex(e => e.registeredAt === this.selectedEvent!.registeredAt);
      if (tlIdx !== -1) {
        this.activePlant.timeline[tlIdx] = this.selectedEvent;
      }
    }

    localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
    const currentEmail = localStorage.getItem('currentUserEmail');
    if (currentEmail) {
      localStorage.setItem(`activePlant_${currentEmail}`, JSON.stringify(this.activePlant));
    }
  }

  async openEditNote() {
    const alert = await this.alertController.create({
      header: 'Editar observación',
      inputs: [
        {
          name: 'note',
          type: 'textarea',
          placeholder: 'Escribe tus observaciones...',
          value: this.selectedEventNote,
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (this.selectedEvent) {
              this.selectedEventNote = data.note;
              this.selectedEvent.description = data.note;
              this.updateCurrentRecord(); // Persist changes
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async analyzeWithAI() {
    if (!this.selectedEvent || this.isAnalyzing) return;
    this.isAnalyzing = true;

    try {
      const photoId = await this.ensureSelectedEventPhotoUploaded();
      const userNote = this.selectedEventNote;
      const plantName = this.activePlant?.name;

      const result: TimelineAiAnalysis = await this.api.analyzePhoto(photoId, userNote, plantName);

      this.aiAnalysis = result;
      this.showAiAnalysis = true;

      // Update the event in the timeline
      if (this.selectedEvent && this.activePlant?.timeline) {
        this.selectedEvent.aiAnalysis = result;
        const idx = this.activePlant.timeline.findIndex(
          e => e.date === this.selectedEvent!.date && e.description === this.selectedEvent!.description
        );
        if (idx >= 0) {
          this.activePlant.timeline[idx].aiAnalysis = result;
        }
      }
    } catch (err) {
      console.error('Error analyzing with AI:', err);
      const toast = await this.toastController.create({
        message: 'Error al analizar con IA. Inténtalo de nuevo.',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.isAnalyzing = false;
    }
  }

  async saveAiAnalysis() {
    if (!this.aiAnalysis || !this.selectedEvent) return;

    this.selectedEvent.aiAnalysis = this.aiAnalysis;
    this.updateCurrentRecord();

    // Persist updated timeline to localStorage
    if (this.activePlant) {
      localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
      const currentEmail = localStorage.getItem('currentUserEmail');
      if (currentEmail) {
        localStorage.setItem(`activePlant_${currentEmail}`, JSON.stringify(this.activePlant));
      }
    }

    const toast = await this.toastController.create({
      message: '✅ Análisis guardado correctamente',
      duration: 2000,
      color: 'success',
      position: 'top',
    });
    await toast.present();

    this.closeRecordDetail();
  }

  private async ensureSelectedEventPhotoUploaded(): Promise<number> {
    if (!this.selectedEvent) {
      throw new Error('No hay registro seleccionado.');
    }

    if (this.selectedEvent.photoId) {
      return this.selectedEvent.photoId;
    }

    if (!this.selectedEvent.imageUrl?.startsWith('data:')) {
      throw new Error('La foto todavía no tiene un identificador para analizarse. Espera a que termine la subida.');
    }

    const userPlantId = Number(localStorage.getItem('activeUserPlantId'));
    if (!userPlantId) {
      throw new Error('No se encontró la planta activa para subir la foto.');
    }

    const formData = this.dataUrlToFormData(this.selectedEvent.imageUrl);
    const uploadResult = await this.api.uploadPhoto(userPlantId, formData);
    const uploadedPhoto = uploadResult?.data || uploadResult;

    if (!uploadedPhoto?.id || !uploadedPhoto?.imageUrl) {
      throw new Error('No se pudo obtener la foto subida para analizarla.');
    }

    this.selectedEvent.photoId = uploadedPhoto.id;
    this.selectedEvent.imageUrl = uploadedPhoto.imageUrl;
    this.updateCurrentRecord();

    return uploadedPhoto.id;
  }

  private dataUrlToFormData(dataUrl: string): FormData {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const formData = new FormData();
    formData.append('file', new Blob([bytes], { type: mime }), `photo_${Date.now()}.jpg`);
    return formData;
  }

  getAiStatusColor(status: string): string {
    switch (status) {
      case 'Excelente': return '#38a872';
      case 'Saludable': return '#38a872';
      case 'Atención recomendada': return '#f39c12';
      case 'Requiere cuidado urgente': return '#e74c3c';
      default: return '#38a872';
    }
  }

  getAnalyzedTimeStr(analyzedAt?: string): string {
    if (!analyzedAt) return '';
    try {
      return new Date(analyzedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  getAnalyzedDateStr(analyzedAt?: string): string {
    if (!analyzedAt) return '';
    try {
      return new Date(analyzedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  }

  getRegisteredTimeStr(registeredAt?: string): string {
    if (!registeredAt) return '';
    try {
      return new Date(registeredAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' a. m.';
    } catch {
      return '';
    }
  }

  // ── Plant modal ──

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

    if (imageUrl.startsWith('local://')) {
      const key = imageUrl.replace('local://', '');
      const stored = localStorage.getItem(key);
      return (
        stored ||
        this.activePlant?.imageUrl ||
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop'
      );
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
        description: 'La planta se ve saludable y firme. Las hojas están verdes y brillantes. Ha crecido desde la última semana.',
        imageUrl:
          this.activePlant?.imageUrl ||
          'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop',
        registeredAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        aiAnalysis: {
          healthScore: 94,
          confidence: 94,
          status: 'Saludable',
          observations: ['Follaje verde y uniforme', 'Sin signos visibles de plagas o enfermedades'],
          recommendations: ['Continúa con el mismo riego.', 'Mantén la planta con buena luz indirecta.', 'No se observan signos de plagas.', 'El crecimiento es normal.'],
          analyzedAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
        },
      },
      {
        date: '12 Abril 2026',
        description: 'Primeras ramas colgantes apareciendo.',
        imageUrl:
          'https://images.unsplash.com/photo-1604762524889-3e2fec45568f?q=80&w=200&auto=format&fit=crop',
        registeredAt: new Date('2026-04-12T10:30:00').toISOString(),
        aiAnalysis: null,
      },
      {
        date: '01 Marzo 2026',
        description: 'Inicio del cultivo del Poto.',
        imageUrl:
          'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=200&auto=format&fit=crop',
        registeredAt: new Date('2026-03-01T08:00:00').toISOString(),
        aiAnalysis: {
          healthScore: 80,
          confidence: 88,
          status: 'Saludable',
          observations: ['Follaje verde y uniforme'],
          recommendations: ['Mantén el cuidado actual'],
          analyzedAt: new Date('2026-03-01T08:31:00').toISOString(),
        },
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
        registeredAt: new Date().toISOString(),
        aiAnalysis: null,
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
    if (this.viewMode === 'record-detail') {
      this.closeRecordDetail();
    } else if (this.viewMode === 'camera' && this.activePlant) {
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
