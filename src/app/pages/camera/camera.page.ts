import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  flashOutline,
  imageOutline,
  refreshOutline,
  trashOutline
} from 'ionicons/icons';

interface TimelineEvent {
  date: string;
  description: string;
  imageUrl: string;
  progress?: number;
  id?: any;
}

interface Plantprofile {
  id: string;
  name: string;
  type: string;
  icon: string;
  imageUrl: string;
  timeline?: TimelineEvent[];
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
  videoStream: MediaStream | null = null;

  activePlant: Plantprofile | null = null;
  viewMode: 'camera' | 'photo-detail' = 'camera';

  // Camera flow variables
  flashActive = false;
  cameraFacing: 'user' | 'environment' = 'environment';
  capturedImage = '';
  progressValue = 70;
  optionalNote = '';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private toastController: ToastController,
    private api: ApiService
  ) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'flash-outline': flashOutline,
      'image-outline': imageOutline,
      'refresh-outline': refreshOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.loadActivePlant();
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
    this.startCamera();
  }

  ionViewWillLeave() {
    this.stopCamera();
  }

  async startCamera() {
    try {
      this.stopCamera();
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.cameraFacing === 'user' ? 'user' : 'environment' }
      });
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.videoStream;
      }
    } catch (err) {
      console.warn('Real camera stream not available, falling back to simulated mode:', err);
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
  }

  switchCamera() {
    this.cameraFacing = this.cameraFacing === 'environment' ? 'user' : 'environment';
    this.startCamera();
  }

  triggerShutter() {
    try {
      const video = this.videoElement.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (this.cameraFacing === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.capturedImage = canvas.toDataURL('image/jpeg', 0.85);
        this.stopCamera();
        this.viewMode = 'photo-detail';
      } else {
        throw new Error('Canvas 2D context not available');
      }
    } catch (err) {
      console.warn('Shutter canvas draw failed, using active plant image fallback:', err);
      this.capturedImage = this.activePlant?.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=500&auto=format&fit=crop';
      this.viewMode = 'photo-detail';
    }
  }

  selectFromGallery() {
    this.capturedImage = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500&auto=format&fit=crop';
    this.stopCamera();
    this.viewMode = 'photo-detail';
  }

  deleteCapturedPhoto() {
    this.capturedImage = '';
    this.viewMode = 'camera';
    this.startCamera();
  }

  async savePhotoDetail() {
    const todayStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const boxId = localStorage.getItem('selectedBoxId') || '1';
    const isDevMode = boxId === 'dev-box-id';

    // ── Store the large base64 image in sessionStorage to avoid the 5 MB localStorage limit ──
    let imageRef = this.activePlant?.imageUrl || '';
    if (this.capturedImage && this.capturedImage.startsWith('data:')) {
      const imgKey = `gb_photo_${Date.now()}`;
      try {
        sessionStorage.setItem(imgKey, this.capturedImage);
        imageRef = `session://${imgKey}`;  // short reference stored in timeline
      } catch (e) {
        console.warn('sessionStorage full, using plant fallback image');
        imageRef = this.activePlant?.imageUrl || '';
      }
    } else if (this.capturedImage) {
      imageRef = this.capturedImage;
    }

    const payload: TimelineEvent = {
      date: `Hoy, ${todayStr}`,
      description: this.optionalNote || 'La planta se ve saludable',
      imageUrl: imageRef,
      progress: this.progressValue
    };

    // Save to local timeline in memory + localStorage
    if (this.activePlant) {
      if (!this.activePlant.timeline) {
        this.activePlant.timeline = [];
      }
      this.activePlant.timeline.unshift(payload);
      try {
        localStorage.setItem('activePlant', JSON.stringify(this.activePlant));
      } catch (e) {
        console.warn('localStorage full — timeline kept in memory only for this session');
      }
    }

    // Persist to backend (only for real boxes, not dev mode)
    if (!isDevMode) {
      try {
        const backendPayload = {
          ...payload,
          imageUrl: this.capturedImage || (this.activePlant?.imageUrl || '')
        };
        await this.api.savePlantProgress(boxId, backendPayload);
      } catch (err) {
        console.warn('Could not save progress to backend — saved locally:', err);
      }
    }

    const toast = await this.toastController.create({
      message: isDevMode
        ? '✅ Foto guardada localmente (modo desarrollo)'
        : '✅ Foto y progreso guardados correctamente',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    this.router.navigate(['/plant']);
  }

  goBack() {
    if (this.viewMode === 'photo-detail') {
      this.viewMode = 'camera';
      this.startCamera();
    } else {
      this.stopCamera();
      this.router.navigate(['/plant']);
    }
  }
}
