const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<your-database-name>.firebaseio.com'
});

const db = admin.firestore();

// Crear usuario y agregarlo a Firestore
async function createUserWithUID(email, password, userData) {
  try {
    const userRecord = await getAuth().createUser({
      email: email,
      password: password
    });

    // Usar el UID para agregar el usuario a Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      ...userData,
      uid: userRecord.uid, // Guardar la UID
      email: userRecord.email
    });

    console.log(`Usuario ${userData.name} agregado con UID: ${userRecord.uid}`);
  } catch (error) {
    console.error('Error creando usuario:', error);
  }
}

async function main() {
  // Crear usuarios
  await createUserWithUID('juan@example.com', 'password123', {
    name: 'Juan',
    lastName: 'Pérez',
    phoneNumber: '+56912345678',
    userType: 'Cliente'
  });

  await createUserWithUID('maria@example.com', 'password123', {
    name: 'María',
    lastName: 'Gómez',
    phoneNumber: '+56987654321',
    userType: 'Cliente'
  });

  // Crear producto de ejemplo
  const productRef = db.collection('products').doc();
  await productRef.set({
    nombre: 'Poleron Nike',
    descripcion: 'Talla L, Color negro',
    precio: 12990,
    emprendedorId: 'LppnPNr2JaZQH66CF5AbajcJO73' // Reemplaza con un UID de emprendedor existente
  });
  console.log('Producto Poleron Nike agregado.');

  // Crear servicio de ejemplo
  const serviceRef = db.collection('services').doc();
  await serviceRef.set({
    nombre: 'Jardinería',
    descripcion: 'Servicio completo de jardinería',
    precio: 12000,
    independienteId: 'N0g1azZqhDd0UZ1NIBbXF95D0Y2' // Reemplaza con un UID de independiente existente
  });
  console.log('Servicio Jardinería agregado.');

  console.log('¡Población de datos completada!');
}

main();
