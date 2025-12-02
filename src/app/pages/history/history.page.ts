import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';

interface BarData {
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HistoryPage implements OnInit {
  isLoading = false;
  
  temperatureData: BarData[] = [];
  humidityData: BarData[] = [];
  lightData: BarData[] = [];
  waterData: BarData[] = [];

  constructor(
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Temperatura - datos como en la imagen (24° - 27°)
    this.temperatureData = [
      { value: 24, percentage: 60 },
      { value: 26, percentage: 80 },
      { value: 25, percentage: 70 },
      { value: 27, percentage: 100 },
      { value: 26, percentage: 80 },
      { value: 25, percentage: 70 }
    ];

    // Humedad - datos como en la imagen (58% - 65%)
    this.humidityData = [
      { value: 58, percentage: 60 },
      { value: 62, percentage: 80 },
      { value: 60, percentage: 70 },
      { value: 65, percentage: 100 },
      { value: 61, percentage: 75 },
      { value: 60, percentage: 70 }
    ];

    // Luz - datos de ejemplo (70% - 85%)
    this.lightData = [
      { value: 75, percentage: 60 },
      { value: 80, percentage: 80 },
      { value: 78, percentage: 70 },
      { value: 85, percentage: 100 },
      { value: 82, percentage: 85 },
      { value: 79, percentage: 75 }
    ];

    // Agua - datos de ejemplo (68% - 78%)
    this.waterData = [
      { value: 70, percentage: 60 },
      { value: 75, percentage: 80 },
      { value: 72, percentage: 70 },
      { value: 78, percentage: 100 },
      { value: 76, percentage: 85 },
      { value: 74, percentage: 75 }
    ];
  }

  refreshData(event: any) {
    // Simular actualización de datos
    setTimeout(() => {
      this.loadData();
      event.target.complete();
    }, 1000);
  }

  goBack() {
    this.navCtrl.back();
  }

  goHome() {
    this.navCtrl.navigateBack('/home');
  }
}