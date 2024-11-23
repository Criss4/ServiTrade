const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Categorías y datos coherentes
const categorias = [
  "Deportes",
  "Tecnología",
  "Moda",
  "Arte",
  "Alimentos",
  "Música",
  "Joyería",
  "Salud",
  "Belleza",
  "Educación",
];

const serviciosPorCategoria = {
  Deportes: [
    { nombre: "Clases de Entrenamiento Personal", descripcion: "Mejora tu rendimiento físico con un profesional." },
    { nombre: "Organización de Eventos Deportivos", descripcion: "Gestión y planificación de competencias." },
  ],
  Tecnología: [
    { nombre: "Desarrollo de Software", descripcion: "Aplicaciones a medida para negocios." },
    { nombre: "Soporte Técnico", descripcion: "Solución de problemas tecnológicos." },
  ],
  Moda: [
    { nombre: "Diseño de Vestuario", descripcion: "Prendas personalizadas para cualquier ocasión." },
    { nombre: "Asesoría de Imagen", descripcion: "Ayuda para definir tu estilo personal." },
  ],
  Arte: [
    { nombre: "Pintura Decorativa", descripcion: "Cuadros personalizados para decorar tu espacio." },
    { nombre: "Esculturas Únicas", descripcion: "Piezas artísticas exclusivas." },
  ],
  Alimentos: [
    { nombre: "Catering Personalizado", descripcion: "Comida para eventos y ocasiones especiales." },
    { nombre: "Clases de Cocina", descripcion: "Aprende a preparar platos deliciosos." },
  ],
  Música: [
    { nombre: "Clases de Piano", descripcion: "Toca piano con técnicas profesionales." },
    { nombre: "Producción Musical", descripcion: "Crea pistas personalizadas para tus proyectos." },
  ],
  Joyería: [
    { nombre: "Creación de Joyas", descripcion: "Piezas únicas para cada ocasión." },
    { nombre: "Reparación de Joyería", descripcion: "Mantenimiento y reparación de joyas." },
  ],
  Salud: [
    { nombre: "Masajes Terapéuticos", descripcion: "Alivio de tensiones musculares." },
    { nombre: "Terapias Alternativas", descripcion: "Tratamientos naturales para el bienestar." },
  ],
  Belleza: [
    { nombre: "Maquillaje Profesional", descripcion: "Maquillaje para eventos importantes." },
    { nombre: "Cuidado Facial", descripcion: "Tratamientos para una piel radiante." },
  ],
  Educación: [
    { nombre: "Clases Particulares", descripcion: "Refuerzo académico para estudiantes." },
    { nombre: "Capacitaciones Profesionales", descripcion: "Talleres de habilidades para el trabajo." },
  ],
};

const generarUbicacionAleatoria = () => {
  const minLat = -33.6;
  const maxLat = -33.4;
  const minLng = -70.8;
  const maxLng = -70.5;

  return {
    latitude: (Math.random() * (maxLat - minLat) + minLat).toFixed(6),
    longitude: (Math.random() * (maxLng - minLng) + minLng).toFixed(6),
  };
};

const crearUsuario = async (email, userData) => {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: "123456",
    });

    await db.collection("users").doc(userRecord.uid).set({
      ...userData,
      uid: userRecord.uid,
      email: userRecord.email,
    });

    console.log(`Usuario creado: ${userData.name} (${userRecord.uid})`);
    return userRecord.uid;
  } catch (error) {
    console.error("Error al crear usuario:", error);
  }
};

const poblarBaseDeDatos = async () => {
  // Crear clientes
  for (let i = 1; i <= 10; i++) {
    await crearUsuario(`cliente${i}@example.com`, {
      name: `Cliente ${i}`,
      lastName: `Apellido ${i}`,
      phoneNumber: `+5691234567${i}`,
      userType: "Cliente",
      categoriasInteres: categorias.slice(0, 3), // Las primeras 3 categorías
      ...generarUbicacionAleatoria(),
    });
  }

  // Crear emprendedores y productos
  for (let i = 1; i <= 10; i++) {
    const emprendedorId = await crearUsuario(`emprendedor${i}@example.com`, {
      name: `Emprendedor ${i}`,
      lastName: `Apellido ${i}`,
      phoneNumber: `+5698765432${i}`,
      userType: "Emprendedor",
      businessName: `Negocio ${i}`,
      businessDescription: `Descripción del negocio ${i}`,
      categoriaAsignada: categorias[i % categorias.length], // Asignar una categoría
      ...generarUbicacionAleatoria(),
    });

    // Crear productos
    for (let j = 1; j <= 2; j++) {
      const productoRef = db.collection("products").doc();
      await productoRef.set({
        nombre: `Producto ${j} de Negocio ${i}`,
        descripcion: `Descripción del producto ${j}`,
        precio: 10000 + j * 500,
        categoria: categorias[i % categorias.length],
        emprendedorId: emprendedorId,
        imagen: `https://via.placeholder.com/150`,
      });
      console.log(`Producto creado: Producto ${j} de Negocio ${i}`);
    }
  }

  // Crear independientes y servicios
  for (let i = 1; i <= 10; i++) {
    const categoria = categorias[i % categorias.length];
    const independienteId = await crearUsuario(`independiente${i}@example.com`, {
      name: `Independiente ${i}`,
      lastName: `Apellido ${i}`,
      phoneNumber: `+5696543210${i}`,
      userType: "Independiente",
      labor: `Labor relacionada con ${categoria.toLowerCase()}`,
      categoriaAsignada: categoria,
      ...generarUbicacionAleatoria(),
    });

    // Crear servicios
    const servicios = serviciosPorCategoria[categoria] || [];
    for (let j = 0; j < servicios.length; j++) {
      const servicio = servicios[j];
      const serviceRef = db.collection("services").doc();
      await serviceRef.set({
        ...servicio,
        independienteId: independienteId,
        ...generarUbicacionAleatoria(),
      });
      console.log(`Servicio creado: ${servicio.nombre}`);
    }
  }

  console.log("¡Base de datos poblada con éxito!");
};

poblarBaseDeDatos();
