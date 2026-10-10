// ===== Fecha local por defecto (nunca UTC) =====
function fechaLocalAhora() {
    const ahora = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return ahora.getFullYear() + "-" + pad(ahora.getMonth() + 1) + "-" + pad(ahora.getDate()) +
           "T" + pad(ahora.getHours()) + ":" + pad(ahora.getMinutes());
}
document.getElementById("fecha").value = fechaLocalAhora();

// ===== Geolocalización del teléfono (precarga y permite editar) =====
function cargarUbicacion() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(function (pos) {
        document.getElementById("latitud").value = pos.coords.latitude.toFixed(6);
        document.getElementById("longitudPos").value = pos.coords.longitude.toFixed(6);
    });
}
document.getElementById("btnGeo").addEventListener("click", function () {
    cargarUbicacion();
});
cargarUbicacion();

// ===== Grabación de audio (Web Speech API) =====
let reconocimiento = null;
document.getElementById("btnGrabar").addEventListener("click", function () {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("El dictado por voz no está soportado en este navegador."); return; }
    if (reconocimiento) { reconocimiento.stop(); reconocimiento = null; this.textContent = "🎙️ Grabar audio"; return; }
    reconocimiento = new SR();
    reconocimiento.lang = "es-ES";
    reconocimiento.interimResults = true;
    const caja = document.getElementById("transcripcion");
    reconocimiento.onresult = function (e) {
        let texto = "";
        for (const r of e.results) texto += r[0].transcript;
        caja.value = texto;
    };
    reconocimiento.onend = function () { reconocimiento = null; document.getElementById("btnGrabar").textContent = "🎙️ Grabar audio"; };
    this.textContent = "⏹️ Detener";
    reconocimiento.start();
});

// ===== Detección simple de valores desde el texto =====
function numeroDespuesDe(texto, palabra) {
    const re = new RegExp(palabra + "[^0-9]{0,20}([0-9]+([.,][0-9]+)?)", "i");
    const m = texto.match(re);
    return m ? parseFloat(m[1].replace(",", ".")) : null;
}

document.getElementById("btnDetectar").addEventListener("click", function () {
    const t = document.getElementById("transcripcion").value.toLowerCase();

    // Longitud de llama
    const lon = numeroDespuesDe(t, "longitud");
    if (lon !== null) document.getElementById("longitud").value = lon;

    // Altura de llama
    let alt = numeroDespuesDe(t, "altura");
    if (alt === null && t.indexOf("altura de un hombre") !== -1) alt = 1.8;
    if (alt === null && t.indexOf("medio metro") !== -1) alt = 0.5;
    if (alt !== null) document.getElementById("altura").value = alt;

    // Velocidad de propagación
    let vel = numeroDespuesDe(t, "velocidad");
    if (vel === null && t.indexOf("rapidísimo") !== -1) vel = 40;
    if (vel === null && t.indexOf("muy rapido") !== -1) vel = 40;
    if (vel === null && t.indexOf("rapido") !== -1) vel = 40;
    if (vel === null && t.indexOf("velocidad media") !== -1) vel = 10;
    if (vel === null && t.indexOf("lento") !== -1) vel = 1;
    if (vel !== null) document.getElementById("velocidad").value = vel;

    // Si solo dice "X metros" y no hay nada cargado, lo sugerimos para altura
    if (alt === null && lon === null) {
        const m = t.match(/([0-9]+([.,][0-9]+)?)\s*metros?/);
        if (m) document.getElementById("altura").value = parseFloat(m[1].replace(",", "."));
    }

    alert("Valores detectados y cargados en el formulario. Revisá antes de guardar.");
});

// ===== Guardado en localStorage =====
function obtenerRegistros() {
    return JSON.parse(localStorage.getItem("registrosIIFF") || "[]");
}

function guardarRegistros(lista) {
    localStorage.setItem("registrosIIFF", JSON.stringify(lista));
}

function mostrarRegistros() {
    const lista = obtenerRegistros();
    const div = document.getElementById("lista");
    if (lista.length === 0) { div.innerHTML = "<p>Todavía no hay registros.</p>"; return; }
    div.innerHTML = "";
    lista.forEach(function (r, i) {
        const item = document.createElement("div");
        item.className = "registro";
        item.innerHTML =
            "<strong>" + r.apellido + ", " + r.nombre + "</strong> · " + r.institucion + "<br>" +
            "📅 " + r.fecha + "<br>" +
            "Longitud: " + (r.longitud || "—") + " m · Altura: " + (r.altura || "—") + " m · Velocidad: " + (r.velocidad || "—") + " m/min<br>" +
            "📍 " + (r.latitud && r.longitudPos ? r.latitud + ", " + r.longitudPos : "Sin ubicación") +
            (r.sector ? " · Sector: " + r.sector : "") +
            '<br><button class="borrar" data-i="' + i + '">Eliminar</button>';
        div.appendChild(item);
    });
    div.querySelectorAll(".borrar").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const lista = obtenerRegistros();
            lista.splice(parseInt(btn.dataset.i), 1);
            guardarRegistros(lista);
            mostrarRegistros();
        });
    });
}

document.getElementById("formRegistro").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("fecha").value = fechaLocalAhora();
    const registro = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        institucion: document.getElementById("institucion").value.trim(),
        fecha: document.getElementById("fecha").value,
        longitud: document.getElementById("longitud").value,
        altura: document.getElementById("altura").value,
        velocidad: document.getElementById("velocidad").value,
        latitud: document.getElementById("latitud").value,
        longitudPos: document.getElementById("longitudPos").value,
        sector: document.getElementById("sector").value.trim()
    };
    const lista = obtenerRegistros();
    lista.push(registro);
    guardarRegistros(lista);
    e.target.reset();
    document.getElementById("fecha").value = fechaLocalAhora();
    document.getElementById("transcripcion").value = "";
    mostrarRegistros();
});

// ===== Archivo para Mesa de Comando / Mesa Operativa =====
document.getElementById("btnInforme").addEventListener("click", function () {
    const lista = obtenerRegistros();
    if (lista.length === 0) { alert("No hay registros para informar."); return; }

    let texto = "INFORME TÉCNICO - INCENDIO FORESTAL (IIFF)\n";
    texto += "Generado: " + new Date().toLocaleString() + "\n";
    texto += "Registros: " + lista.length + "\n";
    texto += "========================================\n\n";
    lista.forEach(function (r, i) {
        texto += "Registro " + (i + 1) + "\n";
        texto += "- Personal: " + r.apellido + ", " + r.nombre + " (" + r.institucion + ")\n";
        texto += "- Fecha y hora: " + r.fecha + "\n";
        texto += "- Sector: " + (r.sector || "No especificado") + "\n";
        texto += "- Coordenadas: " + (r.latitud && r.longitudPos ? r.latitud + ", " + r.longitudPos : "No disponibles") + "\n";
        texto += "- Longitud de llama: " + (r.longitud || "—") + " m\n";
        texto += "- Altura de llama: " + (r.altura || "—") + " m\n";
        texto += "- Velocidad de propagación: " + (r.velocidad || "—") + " m/min\n\n";
    });

    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });

    if (navigator.canShare && navigator.canShare({ files: [new File([blob], "informe_iiff.txt")] })) {
        navigator.share({ files: [new File([blob], "informe_iiff.txt")], title: "Informe IIFF" });
    } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "informe_iiff.txt";
        a.click();
    }
});

mostrarRegistros();
