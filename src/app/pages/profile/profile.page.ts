import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { addIcons } from 'ionicons';
import { chevronBackOutline, cameraOutline, checkmarkCircleOutline, linkOutline, personOutline, mailOutline, homeOutline, statsChartOutline, leafOutline, personAddOutline, imagesOutline, informationCircleOutline, logOutOutline, callOutline, globeOutline, timeOutline, swapHorizontalOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ProfilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  boxId = '';
  userName = '';
  userEmail = '';
  profileImage: string | null = null;
  customImageUrl = '';
  isLoading = false;

  // Cropping & Adjustment Variables
  showCropModal = false;
  cropImageUrl = '';
  zoom = 1.0;
  posX = 0;
  posY = 0;
  rotation = 0;

  // Drag-to-pan states
  isDragging = false;
  startX = 0;
  startY = 0;



  constructor(
    private navCtrl: NavController,
    private router: Router,
    private api: ApiService,
    private toastCtrl: ToastController
  ) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'camera-outline': cameraOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'link-outline': linkOutline,
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'home-outline': homeOutline,
      'stats-chart-outline': statsChartOutline,
      'leaf-outline': leafOutline,
      'person-add-outline': personAddOutline,
      'images-outline': imagesOutline,
      'information-circle-outline': informationCircleOutline,
      'log-out-outline': logOutOutline,
      'swap-horizontal-outline': swapHorizontalOutline
    });
  }

  async ngOnInit() {
    this.boxId = localStorage.getItem('selectedBoxId') || '';
    if (!this.boxId) {
      this.router.navigate(['/login']);
      return;
    }
    await this.loadUserProfile();
  }

  getUserDisplayName(rawDbName: string): string {
    // 1. Prioridad 1: Nombre de usuario registrado en localStorage
    const localUser = localStorage.getItem('userName');
    if (localUser && localUser.trim().length > 0 && !localUser.trim().startsWith('Green-')) {
      return localUser.trim();
    }

    // 2. Prioridad 2: Limpiar el nombre de la DB si es un nombre real (no un código genérico)
    if (rawDbName && rawDbName.trim().length > 0) {
      const parts = rawDbName.split(' | ');
      const cleanName = parts[0].replace(/^caja de\s+/i, '').trim();
      if (cleanName && !cleanName.startsWith('Green-')) {
        return cleanName;
      }
    }

    // 3. Prioridad 3: Extraer del correo electrónico registrado
    const email = localStorage.getItem('currentUserEmail');
    if (email && email.includes('@')) {
      const prefix = email.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    return 'Usuario';
  }

  async loadUserProfile() {
    this.isLoading = true;
    try {
      const res = await this.api.getBoxInfo(this.boxId);
      if (res && res.box) {
        const rawName = res.box.name || '';
        
        // Parse "Caja de [Name] | [Email]"
        const parts = rawName.split(' | ');
        this.userEmail = parts[1] || localStorage.getItem('currentUserEmail') || '';
        this.profileImage = res.box.profileImage || null;
        
        // Cargar nombre priorizado
        this.userName = this.getUserDisplayName(rawName);

      } else {
        // Fallback local storage
        const savedName = localStorage.getItem('selectedBoxName') || 'Usuario';
        this.userEmail = localStorage.getItem('currentUserEmail') || '';
        this.profileImage = localStorage.getItem('profileImage') || null;
        this.userName = this.getUserDisplayName(savedName);
      }
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      const savedName = localStorage.getItem('selectedBoxName') || 'Usuario';
      this.userEmail = localStorage.getItem('currentUserEmail') || '';
      this.profileImage = localStorage.getItem('profileImage') || null;
      this.userName = this.getUserDisplayName(savedName);
    } finally {
      this.isLoading = false;
    }
  }



  triggerFilePicker() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.cropImageUrl = e.target.result;
        this.zoom = 1.0;
        this.posX = 0;
        this.posY = 0;
        this.rotation = 0;
        this.showCropModal = true;
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // allow picking same file
  }

  closeCropModal() {
    this.showCropModal = false;
    this.cropImageUrl = '';
  }

  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.startX = clientX - this.posX;
    this.startY = clientY - this.posY;
  }

  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.posX = Math.round(clientX - this.startX);
    this.posY = Math.round(clientY - this.startY);
  }

  onDragEnd() {
    this.isDragging = false;
  }

  applyCrop() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Transparent background
        ctx.clearRect(0, 0, 300, 300);

        // Apply transformations centered
        ctx.translate(150 + this.posX, 150 + this.posY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.zoom, this.zoom);

        // Draw image centered around original origin
        ctx.drawImage(img, -150, -150, 300, 300);

        // Get base64 representation
        this.profileImage = canvas.toDataURL('image/jpeg', 0.85);
        this.customImageUrl = '';
      }
      this.closeCropModal();
    };
    img.src = this.cropImageUrl;
  }

  async saveChanges() {
    if (!this.userName.trim()) {
      const toast = await this.toastCtrl.create({
        message: 'El nombre es obligatorio.',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    try {
      const cleanName = this.userName.trim();
      const cleanEmail = this.userEmail.trim().toLowerCase();
      // Formato compatible: "Caja de [Nombre] | [correo]"
      const dbName = `Caja de ${cleanName}` + (cleanEmail ? ` | ${cleanEmail}` : '');
      const imageToSave = this.profileImage || null;

      await this.api.updateBoxProfile(this.boxId, dbName, imageToSave);

      // Guardar localmente
      localStorage.setItem('selectedBoxName', `Caja de ${cleanName}`);
      localStorage.setItem('userName', cleanName);
      if (cleanEmail) {
        localStorage.setItem('currentUserEmail', cleanEmail);
      }
      if (imageToSave) {
        localStorage.setItem('profileImage', imageToSave);
      } else {
        localStorage.removeItem('profileImage');
      }

      const toast = await this.toastCtrl.create({
        message: '¡Perfil guardado exitosamente!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
      this.router.navigate(['/home']);
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      const toast = await this.toastCtrl.create({
        message: 'Ocurrió un error al guardar los cambios.',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goStats() {
    this.router.navigate(['/weekly']);
  }

  goMyPlant() {
    const activePlant = localStorage.getItem('activePlant');
    if (!activePlant) {
      this.router.navigate(['/select-plant']);
    } else {
      this.router.navigate(['/plant']);
    }
  }

  addAccount() {
    this.router.navigate(['/login']);
  }

  changeAccount() {
    this.router.navigate(['/register']);
  }

  logout() {
    localStorage.removeItem('selectedBoxId');
    localStorage.removeItem('selectedBoxName');
    localStorage.removeItem('userName');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('activePlant');
    localStorage.removeItem('activePlantId');
    localStorage.removeItem('currentUserEmail');
    this.router.navigate(['/login']);
  }
}
