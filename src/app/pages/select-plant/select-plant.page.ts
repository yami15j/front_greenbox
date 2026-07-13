import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
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
  addCircleOutline
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
    private api: ApiService
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
      addCircleOutline
    });
  }

  async ngOnInit() {
    this.plantProfiles = JSON.parse(JSON.stringify(PLANT_PROFILES));
    this.applyFilter('all');
    await this.loadActivePlant();
  }

  async ionViewWillEnter() {
    await this.loadActivePlant();
  }

  async loadActivePlant() {
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

    const savedPlantId = localStorage.getItem('activePlantId');
    if (savedPlantId) {
      const savedPlant = this.plantProfiles.find(p => p.id === savedPlantId);
      if (savedPlant) {
        this.plantProfiles.forEach(p => p.isActive = false);
        savedPlant.isActive = true;
        this.selectedPlant = savedPlant;
      }
    } else {
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

  async selectPlant(plant: Plantprofile) {
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
            try {
              const response = await this.api.updateBoxPlant(boxId, plant.id);

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
              
              // Volver a la pantalla de detalles de la planta activa
              this.router.navigate(['/plant']);

            } catch (error) {
              console.error('Error al actualizar la planta:', error);

              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'No se pudo actualizar la planta. Por favor, intenta de nuevo.',
                buttons: ['OK']
              });
              await errorAlert.present();
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
    this.router.navigate(['/notification']);
  }
}
