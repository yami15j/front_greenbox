import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  closeOutline,
  flashOutline,
  imageOutline,
  refreshOutline,
  trashOutline
} from 'ionicons/icons';

interface Plantprofile {
  id: string;
  name: string;
  type: string;
  icon: string;
  imageUrl: string;
  timeline?: any[];
}

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CameraPage implements OnInit {

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;
  videoStream: MediaStream | null = null;

  activePlant: Plantprofile | null = null;
  viewMode: 'camera' | 'confirm' | 'photo-detail' = 'camera';

  // Camera flow variables
  flashActive = false;
  cameraFacing: 'user' | 'environment' = 'environment';
  capturedImage = '';
  progressValue = 70;
  optionalNote = '';
  cameraReady = false;
  cameraError = '';
  currentDateStr = '';
  isSaving = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private toastController: ToastController,
    private api: ApiService
  ) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'close-outline': closeOutline,
      'flash-outline': flashOutline,
      'image-outline': imageOutline,
      'refresh-outline': refreshOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.loadActivePlant();
    const today = new Date();
    this.currentDateStr = today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  loadActivePlant() {
    const savedPlant = localStorage.getItem('activePlant');
    if (savedPlant) {
      try {
        this.activePlant = JSON.parse(savedPlant);
      } catch (err) {
        console.warn('Error parsing active plant in camera page:', err);
      }
    }
  }

  ionViewDidEnter() {
    this.cameraReady = false;
    this.cameraError = '';
    this.startCamera();
  }

  ionViewWillLeave() {
    this.stopCamera();
  }

  async startCamera() {
    this.cameraReady = false;
    this.cameraError = '';
    try {
      this.stopCamera();

      if (navigator.permissions) {
        try {
          const perm = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (perm.state === 'denied') {
            this.cameraError = 'Permiso de cámara denegado. Habilítalo en los ajustes del teléfono.';
            return;
          }
        } catch (_) { /* query no soportado en todos los navegadores */ }
      }

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.cameraFacing === 'user' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        video.srcObject = this.videoStream;
        video.onloadedmetadata = () => {
          video.play().then(() => {
            this.cameraReady = true;
          }).catch(() => { this.cameraReady = true; });
        };
      }
    } catch (err: any) {
      console.warn('Error al acceder a la cámara:', err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        this.cameraError = 'Permiso de cámara denegado. Ve a Ajustes > Privacidad > Cámara y habilita el acceso.';
      } else if (err?.name === 'NotFoundError') {
        this.cameraError = 'No se encontró ninguna cámara en este dispositivo.';
      } else {
        this.cameraError = 'No se pudo iniciar la cámara. Inténtalo de nuevo.';
      }
    }
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  toggleFlash() {
    this.flashActive = !this.flashActive;
    if (this.videoStream) {
      const track = this.videoStream.getVideoTracks()[0];
      if (track) {
        try {
          track.applyConstraints({
            advanced: [{ torch: this.flashActive }] as any
          });
        } catch (e) {
          console.warn('Flash/Torch no soportado', e);
        }
      }
    }
  }

  switchCamera() {
    this.cameraFacing = this.cameraFacing === 'environment' ? 'user' : 'environment';
    this.startCamera();
  }

  triggerShutter() {
    try {
      const video = this.videoElement.nativeElement;
      const rawWidth = video.videoWidth || 640;
      const rawHeight = video.videoHeight || 480;
      const size = Math.min(rawWidth, rawHeight);
      const offsetX = (rawWidth - size) / 2;
      const offsetY = (rawHeight - size) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (this.cameraFacing === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
        this.capturedImage = canvas.toDataURL('image/jpeg', 0.85);
        this.stopCamera();
        this.viewMode = 'confirm';
      } else {
        throw new Error('Canvas 2D context not available');
      }
    } catch (err) {
      console.warn('Shutter canvas draw failed, using active plant image fallback:', err);
      this.capturedImage = this.activePlant?.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=500&auto=format&fit=crop';
      this.viewMode = 'confirm';
    }
  }

  selectFromGallery() {
    if (this.galleryInput && this.galleryInput.nativeElement) {
      this.galleryInput.nativeElement.click();
    }
  }

  onGalleryFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.capturedImage = reader.result as string;
      this.stopCamera();
      this.viewMode = 'confirm';
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  retakePhoto() {
    this.capturedImage = '';
    this.viewMode = 'camera';
    this.startCamera();
  }

  usePhoto() {
    this.viewMode = 'photo-detail';
  }

  savePhotoDetail() {
    if (this.isSaving) return;
    this.isSaving = true;

    try {
      const todayStr = new Date().toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      // Guardar imagen en sessionStorage para mostrarse al instante
      const imgKey = `gb_photo_${Date.now()}`;
      let imageRef = this.activePlant?.imageUrl || '';
      const capturedCopy = this.capturedImage;

      if (capturedCopy && capturedCopy.startsWith('data:')) {
        try {
          sessionStorage.setItem(imgKey, capturedCopy);
          imageRef = `session://${imgKey}`;
        } catch (e) {
          console.warn('sessionStorage full');
        }
      } else if (capturedCopy) {
        imageRef = capturedCopy;
      }

      const registeredAt = new Date().toISOString();
      const newEvent = {
        date: `Hoy, ${todayStr}`,
        description: this.optionalNote || 'La planta se ve saludable',
        imageUrl: imageRef,
        progress: this.progressValue,
        registeredAt,
        aiAnalysis: null,
      };

      // Guardar para que plant.page lo tome al regresar
      localStorage.setItem('pendingTimelineEvent', JSON.stringify(newEvent));

      // Toast: fire-and-forget — sin ningún await para evitar bloqueo en Android
      this.toastController.create({
        message: '✅ Registro guardado correctamente',
        duration: 2000,
        color: 'success',
        position: 'top'
      }).then(t => t.present()).catch(() => {});

      // Navegar de inmediato sin esperar nada
      this.isSaving = false;
      this.router.navigate(['/plant']);

      // Subir a Cloudinary en segundo plano (capturamos todo antes de navegar)
      const userPlantId = localStorage.getItem('activeUserPlantId');
      const plantId = this.activePlant?.id || localStorage.getItem('activePlantId') || 'default';
      if (userPlantId && capturedCopy && capturedCopy.startsWith('data:')) {
        this.uploadToCloudinaryBackground(capturedCopy, registeredAt, Number(userPlantId), plantId);
      }

    } catch (err) {
      console.error('Error al guardar:', err);
      this.isSaving = false;
    }
  }

  /** Sube la foto a Cloudinary en segundo plano sin bloquear la UI */
  private uploadToCloudinaryBackground(
    dataUrl: string,
    registeredAt: string,
    userPlantId: number,
    plantId: string
  ) {
    (async () => {
      try {
        const [header, base64] = dataUrl.split(',');
        const mime = header.match(/:(.*?);/)![1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mime });

        const formData = new FormData();
        formData.append('file', blob, `photo_${Date.now()}.jpg`);

        const result = await this.api.uploadPhoto(userPlantId, formData);
        const cloudinaryUrl = result?.data?.imageUrl || result?.imageUrl;

        if (cloudinaryUrl) {
          // Actualizar la URL en los eventos custom persistidos
          const key = `customTimelineEvents_${plantId}`;
          const events: any[] = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = events.findIndex((e: any) => e.registeredAt === registeredAt);
          if (idx >= 0) {
            events[idx].imageUrl = cloudinaryUrl;
            localStorage.setItem(key, JSON.stringify(events));
          }
          console.log('✅ Foto subida a Cloudinary:', cloudinaryUrl);
        }
      } catch (err) {
        console.warn('Background Cloudinary upload failed (no crítico):', err);
      }
    })();
  }

  goBack() {
    if (this.viewMode === 'photo-detail') {
      this.viewMode = 'confirm';
    } else if (this.viewMode === 'confirm') {
      this.viewMode = 'camera';
      this.startCamera();
    } else {
      this.stopCamera();
      this.router.navigate(['/plant']);
    }
  }
}
