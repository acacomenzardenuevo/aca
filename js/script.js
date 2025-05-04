// Fecha y hora fija: 11 mayo 2025, 6:00 AM en CDMX (CST)
const fechaCDMX = moment.tz("2025-05-11 06:00", "America/Mexico_City");
// Constante con el enlace
const enlaceWhatsApp = "https://chat.whatsapp.com/I2V6saqg4BeFeYzDklQ7F7";
// Asignar al href dinámicamente
document.getElementById("whatsappLink1").href = enlaceWhatsApp;
document.getElementById("whatsappLink2").href = enlaceWhatsApp;
document.getElementById("whatsappLink3").href = enlaceWhatsApp;
// Asignar al href taller de pasos

function mostrarEquivalente() {
    const zonaSeleccionada = document.getElementById('zona').value;
    if (!zonaSeleccionada) {
      document.getElementById('equivalente').textContent = "Selecciona una zona horaria.";
      return;
    }
    
    // Convertir la hora de CDMX a la zona seleccionada usando Moment.js y Moment Timezone
    const fechaZona = fechaCDMX.clone().tz(zonaSeleccionada);
    // Obtener la hora formateada para la zona seleccionada
    const horaFormateada = fechaZona.format('hh:mm A');
    document.getElementById('equivalente').textContent =
      `${horaFormateada}`;
  }

  function actualizarCuentaRegresiva() {
    const ahora = moment.tz("America/Mexico_City");
    const duracion = moment.duration(fechaCDMX.diff(ahora));

    if (duracion.asSeconds() <= 0) {
      document.getElementById("reloj").textContent = "¡La fecha ha llegado!";
      clearInterval(timer);
      return;
    }

    const dias = Math.floor(duracion.asDays());
    const horas = duracion.hours();
    const minutos = duracion.minutes();
    const segundos = duracion.seconds();

    document.getElementById("reloj").textContent =
      `Faltan: ${dias} días ${horas} horas ${minutos} minutos ${segundos} segundos`;
  }

  actualizarCuentaRegresiva(); // Mostrar inmediatamente
  const timer = setInterval(actualizarCuentaRegresiva, 1000); // Actualizar cada segundo