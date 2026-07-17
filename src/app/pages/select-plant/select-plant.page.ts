import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
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
  personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-select-plant',
  templateUrl: './select-plant.page.html',
  styleUrls: ['./select-plant.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class SelectPlantPage implements OnInit {

  plantProfiles: Plantprofile[] = [];
  filteredPlants: Plantprofile[] = [];
  selectedPlant: Plantprofile | null = null;
  filterType: string = 'all';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private api: ApiService,
    private socketService: SocketService
  ) {
    // Registrar iconos necesarios
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
      'person-outline': personOutline
    });
  }

  async ngOnInit() {
    this.plantProfiles = JSON.parse(JSON.stringify(PLANT_PROFILES));
    this.applyFilter('all');
    await this.initializePage();
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
      const savedPlant = this.plantProfiles.find(p => p.id === savedPlantId);
      if (savedPlant) {
        this.plantProfiles.forEach(p => p.isActive = false);
        savedPlant.isActive = true;
        this.selectedPlant = savedPlant;
      }
    }

    const boxId = localStorage.getItem('selectedBoxId');
    if (boxId) {
      try {
        const boxInfo = await this.api.getBoxInfo(boxId);
        if (boxInfo && boxInfo.box && boxInfo.box.plant) {
          const plantId = boxInfo.box.plant.id;
          if (plantId) {
            // Encontrar perfil de planta
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
      this.filteredPlants = this.plantProfiles.filter(p => p.type === type);
    }
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
    await restoreUserScopedStorageFromFirebase();

    const boxId = localStorage.getItem('selectedBoxId');

    if (!boxId) {
      const errorAlert = await this.alertController.create({
        header: 'Error de Sesión',
        message: 'Debes iniciar sesión primero para seleccionar una planta.',
        buttons: [
          {
            text: 'Ir a Login',
            handler: () => {
              this.router.navigate(['/login']);
            }
          }
        ]
      });
      await errorAlert.present();
      return;
    }

    const confirmAlert = await this.alertController.create({
      header: '¿Activar planta?',
      message: `¿Deseas activar ${plant.name} como tu cultivo actual?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'OK',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Actualizando cultivo en GreenBox (despertando servidor)...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              this.applyPlantSelectionLocally(plant);
              const response: any = await this.updatePlantWithTimeout(boxId, plant.id);

              if (response && response.data && response.data.id) {
                const oldUserPlantId = localStorage.getItem('activeUserPlantId');
                if (oldUserPlantId) {
                  this.socketService.leavePlant(Number(oldUserPlantId));
                }
                localStorage.setItem('activeUserPlantId', String(response.data.id));
                this.socketService.joinPlant(response.data.id);
              }

              if (response?.data?.plant) {
                localStorage.setItem('activePlant', JSON.stringify(response.data.plant));
                const currentEmail = localStorage.getItem('currentUserEmail');
                if (currentEmail) {
                  localStorage.setItem('activePlant_' + currentEmail, JSON.stringify(response.data.plant));
                }
              }

              await loading.dismiss();

              const successAlert = await this.alertController.create({
                header: '✔ Planta Activada',
                message: `${plant.name} ha sido configurada correctamente en el servidor.`,
                buttons: ['OK']
              });
              await successAlert.present();
              await successAlert.onDidDismiss();
              
              // Volver a la pantalla de Home
              this.router.navigate(['/home']);

            } catch (error: any) {
              await loading.dismiss();
              console.warn('Error al actualizar la planta en el backend, usando activación local:', error);

              // Fallback: mantener activación local para no bloquear el flujo
              this.applyPlantSelectionLocally(plant);

              const successAlert = await this.alertController.create({
                header: '✔ Cultivo Activado (Modo Local)',
                message: `${plant.name} ha sido activada localmente. (El servidor de Render está respondiendo lento o apagado).`,
                buttons: ['OK']
              });
              await successAlert.present();
              await successAlert.onDidDismiss();

              // Volver a la pantalla de Home
              this.router.navigate(['/home']);
            }
          }
        }
      ]
    });
    await confirmAlert.present();
  }

  goBack() {
    this.router.navigate(['/plant']);
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
}
