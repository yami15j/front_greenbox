export interface TimelineEvent {
  date: string;
  description: string;
  imageUrl: string;
  progress?: number;
  id?: any;
}

export interface Plantprofile {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  imageUrl: string;
  optimalConditions: {
    tempMin: number;
    tempMax: number;
    humMin: number;
    humMax: number;
    lightMin: number;
    lightMax: number;
    waterMin: number;
  };
  growthTime: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  benefits: string[];
  isActive?: boolean;
  daysSincePlanting?: number;
  timeline?: TimelineEvent[];
  taxonomy?: {
    reino: string;
    division: string;
    clase: string;
    orden: string;
    familia: string;
    genero: string;
    especie: string;
  };
}

export const PLANT_PROFILES: Plantprofile[] = [
  {
    id: 'poto',
    name: 'Poto',
    type: 'Hoja Verde',
    icon: '🌿',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=500&auto=format&fit=crop',
    optimalConditions: { tempMin: 18, tempMax: 29, humMin: 40, humMax: 60, lightMin: 50, lightMax: 70, waterMin: 50 },
    growthTime: 'Constante',
    difficulty: 'Fácil',
    benefits: ['SALUDABLE', 'ORGÁNICO'],
    isActive: false,
    daysSincePlanting: 45,
    description: 'Planta trepadora de interior muy popular, conocida por sus hojas en forma de corazón con matices amarillos o blancos. Es extremadamente resistente y excelente para purificar el aire.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Alismatales',
      familia: 'Araceae',
      genero: 'Epipremnum',
      especie: 'Epipremnum aureum'
    },
    timeline: [
      { date: 'Hoy, 20 Mayo 2026', description: 'La planta se ve saludable y firme.', imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop' },
      { date: '12 Abril 2026', description: 'Primeras ramas colgantes apareciendo.', imageUrl: 'https://images.unsplash.com/photo-1604762524889-3e2fec45568f?q=80&w=200&auto=format&fit=crop' },
      { date: '01 Marzo 2026', description: 'Inicio del cultivo del Poto.', imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'crassula_muscosa',
    name: 'Crassula Muscosa',
    type: 'Suculenta',
    icon: '🌱',
    imageUrl: 'assets/plants/crassula_mucosa.jpg',
    optimalConditions: { tempMin: 15, tempMax: 24, humMin: 30, humMax: 50, lightMin: 60, lightMax: 80, waterMin: 40 },
    growthTime: 'Lento',
    difficulty: 'Fácil',
    benefits: ['SALUDABLE', 'ORGÁNICO'],
    isActive: false,
    daysSincePlanting: 60,
    description: 'Planta suculenta originaria de Sudáfrica, caracterizada por tallos delgados y erectos densamente cubiertos de hojas diminutas dispuestas en cuatro filas, lo que le da un aspecto similar a un musgo o cola de lagarto.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Saxifragales',
      familia: 'Crassulaceae',
      genero: 'Crassula',
      especie: 'Crassula muscosa'
    },
    timeline: [
      { date: 'Hoy, 20 Mayo 2026', description: 'Tallos firmes con follaje denso.', imageUrl: 'assets/plants/crassula_mucosa.jpg' },
      { date: '05 Febrero 2026', description: 'Inicio del cultivo de Crassula.', imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'basil',
    name: 'Albahaca',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/albahaca.jpg',
    optimalConditions: { tempMin: 18, tempMax: 25, humMin: 55, humMax: 75, lightMin: 65, lightMax: 85, waterMin: 65 },
    growthTime: '20-30 días',
    difficulty: 'Fácil',
    benefits: ['DIGESTIVO', 'SABOR'],
    isActive: false,
    daysSincePlanting: 25,
    description: 'Hierba aromática anual, muy utilizada en la cocina mediterránea. Requiere clima cálido y riego regular, y es famosa por sus propiedades digestivas y su fragancia agradable.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Lamiales',
      familia: 'Lamiaceae',
      genero: 'Ocimum',
      especie: 'Ocimum basilicum'
    },
    timeline: [
      { date: 'Hoy, 20 Mayo 2026', description: 'Hojas tiernas listas para cosecha.', imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop' },
      { date: '10 Mayo 2026', description: 'Inicio del cultivo de Albahaca.', imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'strawberry',
    name: 'Fresa',
    type: 'Fruto',
    icon: '🍓',
    imageUrl: 'assets/plants/fresa.jpg',
    optimalConditions: { tempMin: 18, tempMax: 26, humMin: 60, humMax: 80, lightMin: 70, lightMax: 90, waterMin: 70 },
    difficulty: 'Intermedio',
    benefits: ['VITAMINA C', 'DULCE'],
    isActive: false,
    daysSincePlanting: 50,
    growthTime: '50-60 días',
    description: 'Planta herbácea perenne de porte bajo que produce frutos rojos muy dulces y aromáticos. Requiere buena iluminación y riego constante para mantener la humedad del suelo.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Rosales',
      familia: 'Rosaceae',
      genero: 'Fragaria',
      especie: 'Fragaria ananassa'
    },
    timeline: [
      { date: 'Hoy, 20 Mayo 2026', description: 'Primeros brotes de flores blancas.', imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop' },
      { date: '15 Abril 2026', description: 'Inicio del cultivo de Fresa.', imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'chives',
    name: 'Cebollín',
    type: 'Hierba Aromática',
    icon: '🧅',
    imageUrl: 'assets/plants/cebollin.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, lightMin: 50, lightMax: 70, waterMin: 60 },
    growthTime: '30-40 días',
    difficulty: 'Fácil',
    benefits: ['SAZONADOR'],
    isActive: false,
    description: 'Hierba aromática perenne de hojas cilíndricas y huecas con un suave sabor aliáceo.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Asparagales',
      familia: 'Amaryllidaceae',
      genero: 'Allium',
      especie: 'Allium schoenoprasum'
    }
  },
  {
    id: 'coriander',
    name: 'Cilantro',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/cilantro.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, lightMin: 50, lightMax: 70, waterMin: 60 },
    growthTime: '20-30 días',
    difficulty: 'Fácil',
    benefits: ['FRESCO'],
    isActive: false,
    description: 'Planta anual con hojas muy aromáticas utilizadas ampliamente en la gastronomía de todo el mundo.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Apiales',
      familia: 'Apiaceae',
      genero: 'Coriandrum',
      especie: 'Coriandrum sativum'
    }
  },
  {
    id: 'kale',
    name: 'Colrizada',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/colrizada.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 60, humMax: 80, lightMin: 60, lightMax: 80, waterMin: 70 },
    growthTime: '45-60 días',
    difficulty: 'Intermedio',
    benefits: ['SÚPER ALIMENTO'],
    isActive: false,
    description: 'Variedad de col cuyas hojas no forman cogollo, extremadamente rica en nutrientes.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Brassicales',
      familia: 'Brassicaceae',
      genero: 'Brassica',
      especie: 'Brassica oleracea'
    }
  },
  {
    id: 'spinach',
    name: 'Espinaca',
    type: 'Hoja Verde',
    icon: '🥗',
    imageUrl: 'assets/plants/espinacas.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 60, humMax: 80, lightMin: 60, lightMax: 80, waterMin: 70 },
    growthTime: '35-45 días',
    difficulty: 'Fácil',
    benefits: ['HIERRO'],
    isActive: false,
    description: 'Planta anual de hojas comestibles, ovaladas y verdes, rica en vitaminas y minerales.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Caryophyllales',
      familia: 'Amaranthaceae',
      genero: 'Spinacia',
      especie: 'Spinacia oleracea'
    }
  },
  {
    id: 'lettuce',
    name: 'Lechuga',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/lechuga.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 60, humMax: 80, lightMin: 60, lightMax: 80, waterMin: 70 },
    growthTime: '30-45 días',
    difficulty: 'Fácil',
    benefits: ['LIGERA'],
    isActive: false,
    description: 'Planta herbácea cultivada por sus hojas que se consumen generalmente en ensaladas.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Asterales',
      familia: 'Asteraceae',
      genero: 'Lactuca',
      especie: 'Lactuca sativa'
    }
  },
  {
    id: 'mint',
    name: 'Menta',
    type: 'Hierba Aromática',
    icon: '🌱',
    imageUrl: 'assets/plants/menta.jpg',
    optimalConditions: { tempMin: 16, tempMax: 24, humMin: 60, humMax: 80, lightMin: 50, lightMax: 70, waterMin: 70 },
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: ['MEDICINAL', 'DIGESTIVA'],
    isActive: false,
    daysSincePlanting: 32,
    description: 'Planta herbácea perenne de rápido crecimiento, muy valorada por sus propiedades medicinales que favorecen la digestión y el alivio del estrés. Sus hojas de color verde intenso desprenden un perfume fresco y característico con solo tocarlas.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Lamiales',
      familia: 'Lamiaceae',
      genero: 'Mentha',
      especie: 'Mentha spicata'
    },
    timeline: [
      { date: 'Hoy, 20 Mayo 2026', description: 'La planta se ve saludable', imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=200&auto=format&fit=crop' },
      { date: 'Hoy, 13 Enero 2026', description: 'Nuevas hojas en crecimiento', imageUrl: 'https://images.unsplash.com/photo-1604762524889-3e2fec45568f?q=80&w=200&auto=format&fit=crop' },
      { date: '15 Diciembre 2025', description: 'Inicio de la Planta', imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'cucumber',
    name: 'Pepino',
    type: 'Fruto',
    icon: '🥒',
    imageUrl: 'assets/plants/pepino.jpg',
    optimalConditions: { tempMin: 18, tempMax: 25, humMin: 50, humMax: 70, lightMin: 70, lightMax: 90, waterMin: 75 },
    growthTime: '50-60 días',
    difficulty: 'Intermedio',
    benefits: ['HIDRATACIÓN'],
    isActive: false,
    description: 'Fruto cilíndrico, verde y crujiente, ideal para ensaladas refrescantes.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Cucurbitales',
      familia: 'Cucurbitaceae',
      genero: 'Cucumis',
      especie: 'Cucumis sativus'
    }
  },
  {
    id: 'parsley',
    name: 'Perejil',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/perejil.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, lightMin: 50, lightMax: 70, waterMin: 60 },
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: ['ANTOXIDANTE'],
    isActive: false,
    description: 'Hierba aromática bienal de hojas verdes y dentadas, muy rica en vitamina C.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Apiales',
      familia: 'Apiaceae',
      genero: 'Petroselinum',
      especie: 'Petroselinum crispum'
    }
  },
  {
    id: 'pepper',
    name: 'Pimiento',
    type: 'Fruto',
    icon: '🌶️',
    imageUrl: 'assets/plants/pimiento.jpg',
    optimalConditions: { tempMin: 20, tempMax: 28, humMin: 50, humMax: 70, lightMin: 80, lightMax: 100, waterMin: 75 },
    growthTime: '60-85 días',
    difficulty: 'Intermedio',
    benefits: ['VITAMINA A'],
    isActive: false,
    description: 'Fruto comestible, carnoso y dulce de una gran variedad de colores.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Solanales',
      familia: 'Solanaceae',
      genero: 'Capsicum',
      especie: 'Capsicum annuum'
    }
  },
  {
    id: 'radish',
    name: 'Rábano',
    type: 'Raíz',
    icon: '🔴',
    imageUrl: 'assets/plants/rabano.jpg',
    optimalConditions: { tempMin: 15, tempMax: 20, humMin: 50, humMax: 70, lightMin: 60, lightMax: 80, waterMin: 60 },
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: ['PICANTE'],
    isActive: false,
    description: 'Raíz carnosa y redonda de sabor picante y crujiente, de cultivo extremadamente rápido.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Brassicales',
      familia: 'Brassicaceae',
      genero: 'Raphanus',
      especie: 'Raphanus sativus'
    }
  },
  {
    id: 'arugula',
    name: 'Rúcula',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/rucula.jpg',
    optimalConditions: { tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, lightMin: 60, lightMax: 80, waterMin: 65 },
    growthTime: '30-40 días',
    difficulty: 'Fácil',
    benefits: ['SABOR INTENSO'],
    isActive: false,
    description: 'Planta de hojas dentadas y sabor ligeramente picante y a nuez.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Brassicales',
      familia: 'Brassicaceae',
      genero: 'Eruca',
      especie: 'Eruca vesicaria'
    }
  },
  {
    id: 'tomato',
    name: 'Tomate',
    type: 'Fruto',
    icon: '🍅',
    imageUrl: 'assets/plants/tomato.jpg',
    optimalConditions: { tempMin: 20, tempMax: 30, humMin: 50, humMax: 70, lightMin: 70, lightMax: 90, waterMin: 75 },
    growthTime: '60-80 días',
    difficulty: 'Intermedio',
    benefits: ['LICOPENO'],
    isActive: false,
    description: 'Fruto rojo, jugoso y versátil, rico en antioxidantes.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Solanales',
      familia: 'Solanaceae',
      genero: 'Solanum',
      especie: 'Solanum lycopersicum'
    }
  },
  {
    id: 'carrot',
    name: 'Zanahoria',
    type: 'Raíz',
    icon: '🥕',
    imageUrl: 'assets/plants/zanahoria.jpg',
    optimalConditions: { tempMin: 16, tempMax: 24, humMin: 50, humMax: 70, lightMin: 70, lightMax: 90, waterMin: 60 },
    growthTime: '70-90 días',
    difficulty: 'Intermedio',
    benefits: ['BETACAROTENO'],
    isActive: false,
    description: 'Raíz alargada y anaranjada de sabor dulce, excelente para la salud ocular.',
    taxonomy: {
      reino: 'Plantae',
      division: 'Magnoliophyta',
      clase: 'Magnoliopsida',
      orden: 'Apiales',
      familia: 'Apiaceae',
      genero: 'Daucus',
      especie: 'Daucus carota'
    }
  }
];
