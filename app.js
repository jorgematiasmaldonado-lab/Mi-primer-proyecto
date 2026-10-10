// ============================================
// ETAC - Cronograma de Licencia Anual 2026 - 2027
// Guardia A - BASE PUNILLA
// Diseñado por: Maldonado Jorge Matias
// Email: Jorgematiasmaldonado@gmail.com
// Efectivo ETAC Punilla
// ============================================

// Feriados nacionales de Argentina con sus nombres
const FERIADOS = {
    '2026-12-08': 'Inmaculada Concepción',
    '2026-12-24': 'Noche Buena',
    '2026-12-25': 'Navidad',
    '2026-12-31': 'Año Viejo',
    '2027-01-01': 'Año Nuevo',
    '2027-02-08': 'Carnaval',
    '2027-02-09': 'Carnaval',
    '2027-03-24': 'Día Nacional de la Memoria por la Verdad y la Justicia',
    '2027-03-26': 'Viernes Santo',
    '2027-04-02': 'Día del Veterano y de los Caídos en la Guerra de Malvinas',
    '2027-05-01': 'Día del Trabajador',
    '2027-05-25': 'Día de la Revolución de Mayo',
    '2027-06-20': 'Paso a la Inmortalidad del General Manuel Belgrano',
};

// Fechas límite del período de licencia
const FECHA_MINIMA = '2026-12-01';
const FECHA_MAXIMA = '2027-06-30';

// Máximo de personas simultáneas
const MAX_SIMULTANEAS = 3;

// Clave para localStorage
const STORAGE_KEY = 'vacaciones_efectivos';

// Estado del calendario
let mesMostrado = new Date();

// ID del efectivo que se está editando (null = no editando)
let editandoId = null;

// ============================================
// Funciones de utilidad
// ============================================

function formatearFechaLocal(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return año + '-' + mes + '-' + dia;
}

function esDiaNoHabil(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const diaSemana = fecha.getDay();
    return diaSemana === 0 || diaSemana === 6 || FERIADOS.hasOwnProperty(fechaStr);
}

function obtenerDiasHabiles(fechaInicio, fechaFin) {
    const dias = [];
    let actual = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T00:00:00');

    while (actual <= fin) {
        const fechaStr = formatearFechaLocal(actual);
        if (!esDiaNoHabil(fechaStr)) {
            dias.push(fechaStr);
        }
        actual.setDate(actual.getDate() + 1);
    }

    return dias;
}

function obtenerPrimerosDiasHabiles(fechaInicio, cantidad) {
    const dias = [];
    let actual = new Date(fechaInicio + 'T00:00:00');
    let contador = 0;

    while (contador < cantidad) {
        const fechaStr = formatearFechaLocal(actual);
        if (!esDiaNoHabil(fechaStr)) {
            dias.push(fechaStr);
            contador++;
        }
        actual.setDate(actual.getDate() + 1);
    }

    return dias;
}

function contarEnDia(fechaStr, efectivos) {
    let count = 0;
    for (let i = 0; i < efectivos.length; i++) {
        if (efectivos[i].dias.indexOf(fechaStr) !== -1) {
            count++;
        }
    }
    return count;
}

function obtenerApellidosEnDia(fechaStr, efectivos) {
    const apellidos = [];
    for (let i = 0; i < efectivos.length; i++) {
        if (efectivos[i].dias.indexOf(fechaStr) !== -1) {
            const nombre = efectivos[i].nombre;
            const partes = nombre.split(',');
            apellidos.push(partes[0].trim());
        }
    }
    return apellidos;
}

function obtenerEfectivosEnDia(fechaStr, efectivos) {
    const personas = [];
    for (let i = 0; i < efectivos.length; i++) {
        const ef = efectivos[i];
        if (ef.dias.indexOf(fechaStr) !== -1) {
            let franja = '';
            if (ef.franja1.indexOf(fechaStr) !== -1) {
                franja = '1ª franja';
            } else if (ef.franja2.indexOf(fechaStr) !== -1) {
                franja = '2ª franja';
            }
            personas.push({ nombre: ef.nombre, franja: franja });
        }
    }
    return personas;
}

function formatearFechaLegible(fechaStr) {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

// ============================================
// Gestión de datos (localStorage)
// ============================================

function cargarEfectivos() {
    try {
        const datos = localStorage.getItem(STORAGE_KEY);
        return datos ? JSON.parse(datos) : [];
    } catch (e) {
        return [];
    }
}

function guardarEfectivos(efectivos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(efectivos));
    } catch (e) {
        // Si no se puede guardar, continuar sin error
    }
}

// ============================================
// Calendario
// ============================================

function obtenerDiasDelMes(año, mes) {
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    const dias = [];

    for (let i = 0; i < diaSemanaInicio; i++) {
        dias.push(null);
    }

    for (let d = 1; d <= diasEnMes; d++) {
        const fecha = new Date(año, mes, d);
        dias.push(formatearFechaLocal(fecha));
    }

    return dias;
}

function obtenerNombreMes(año, mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes] + ' ' + año;
}

function calcularFranjas(fechaInicio, diasFranja1, fechaInicioFranja2, diasFranja2) {
    const franja1 = [];
    if (fechaInicio && diasFranja1 > 0) {
        const dias = obtenerPrimerosDiasHabiles(fechaInicio, diasFranja1);
        for (let i = 0; i < dias.length; i++) {
            franja1.push(dias[i]);
        }
    }

    const franja2 = [];
    if (fechaInicioFranja2 && diasFranja2 > 0) {
        const dias = obtenerPrimerosDiasHabiles(fechaInicioFranja2, diasFranja2);
        for (let i = 0; i < dias.length; i++) {
            franja2.push(dias[i]);
        }
    }

    return { franja1: franja1, franja2: franja2 };
}

function renderizarCalendario() {
    const calendario = document.getElementById('calendario');
    const mesLabel = document.getElementById('mesActual');
    const ayuda = document.getElementById('ayudaCalendario');
    const efectivos = cargarEfectivos();

    const fechaInicio = document.getElementById('fechaInicio').value;
    const diasF1 = parseInt(document.getElementById('diasFranja1').value, 10) || 0;
    const fechaInicioF2 = document.getElementById('fechaInicioFranja2').value;
    const diasF2 = parseInt(document.getElementById('diasFranja2').value, 10) || 0;

    let franja1 = [];
    let franja2 = [];
    let hayFranjas = false;

    if (fechaInicio && diasF1 > 0) {
        const calculado = calcularFranjas(fechaInicio, diasF1, fechaInicioF2, diasF2);
        franja1 = calculado.franja1;
        franja2 = calculado.franja2;
        hayFranjas = true;
    } else if (fechaInicioF2 && diasF2 > 0) {
        const calculado = calcularFranjas(fechaInicio, diasF1, fechaInicioF2, diasF2);
        franja2 = calculado.franja2;
        hayFranjas = true;
    }

    if (ayuda) {
        if (hayFranjas) {
            ayuda.style.display = 'none';
        } else {
            ayuda.style.display = 'block';
        }
    }

    const año = mesMostrado.getFullYear();
    const mes = mesMostrado.getMonth();

    mesLabel.textContent = obtenerNombreMes(año, mes);

    const dias = obtenerDiasDelMes(año, mes);
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    let html = '';
    for (let i = 0; i < diasSemana.length; i++) {
        html += '<div class="dia-header">' + diasSemana[i] + '</div>';
    }

    for (let i = 0; i < dias.length; i++) {
        const fechaStr = dias[i];

        if (!fechaStr) {
            html += '<div class="dia vacio"></div>';
            continue;
        }

        const fecha = new Date(fechaStr + 'T00:00:00');
        const diaSemana = fecha.getDay();
        const esFeriado = FERIADOS.hasOwnProperty(fechaStr);
        const esFinde = diaSemana === 0 || diaSemana === 6;

        const apellidos = obtenerApellidosEnDia(fechaStr, efectivos);
        const enFranja1 = franja1.indexOf(fechaStr) !== -1;
        const enFranja2 = franja2.indexOf(fechaStr) !== -1;

        // Verificar si el día supera el cupo máximo
        const cantidadEnDia = contarEnDia(fechaStr, efectivos);
        const esProhibido = cantidadEnDia > MAX_SIMULTANEAS;

        let clase = 'dia ';

        if (esFeriado) {
            clase += 'feriado';
        } else if (esFinde) {
            clase += 'ocupado-otro';
        } else if (esProhibido) {
            clase += 'prohibido';
        } else if (enFranja1) {
            clase += 'franja1';
        } else if (enFranja2) {
            clase += 'franja2';
        } else if (apellidos.length > 0) {
            clase += 'ocupado-otro';
        } else {
            clase += 'libre';
        }

        let apellidoHtml = '';
        if (apellidos.length > 0) {
            apellidoHtml = '<span class="apellido">' + apellidos.join(', ') + '</span>';
        }

        html += '<div class="' + clase + '" data-fecha="' + fechaStr + '"><span class="numero">' + fecha.getDate() + '</span>' + apellidoHtml + '</div>';
    }

    calendario.innerHTML = html;

    // Agregar eventos de tooltip
    const diasConFecha = calendario.querySelectorAll('.dia[data-fecha]');
    for (let i = 0; i < diasConFecha.length; i++) {
        diasConFecha[i].addEventListener('mouseenter', mostrarTooltip);
        diasConFecha[i].addEventListener('mouseleave', ocultarTooltip);
        diasConFecha[i].addEventListener('click', mostrarTooltip);
    }

    // Actualizar contadores
    document.getElementById('contadorFranja1').textContent = franja1.length;
    document.getElementById('contadorFranja2').textContent = franja2.length;
    document.getElementById('contadorTotal').textContent = franja1.length + franja2.length;
}

// ============================================
// Tooltip
// ============================================

function mostrarTooltip(event) {
    const fechaStr = event.currentTarget.dataset.fecha;
    const efectivos = cargarEfectivos();
    const tooltip = document.getElementById('tooltip');

    const personas = obtenerEfectivosEnDia(fechaStr, efectivos);
    const esFeriado = FERIADOS.hasOwnProperty(fechaStr);
    const cantidadEnDia = contarEnDia(fechaStr, efectivos);
    const esProhibido = cantidadEnDia > MAX_SIMULTANEAS;

    let html = '<div class="fecha">' + formatearFechaLegible(fechaStr) + '</div>';

    // Mostrar nombre del feriado si es un día feriado
    if (esFeriado) {
        html += '<div class="feriado">' + FERIADOS[fechaStr] + '</div>';
    }

    // Mostrar advertencia si supera el cupo
    if (esProhibido) {
        html += '<div class="prohibido">Supera el cupo (' + cantidadEnDia + ' personas)</div>';
    }

    if (personas.length === 0) {
        html += '<div class="sin-vacaciones">Sin licencia</div>';
    } else {
        for (let i = 0; i < personas.length; i++) {
            html += '<div class="persona"><div class="nombre">' + personas[i].nombre + '</div><div class="franja">' + personas[i].franja + '</div></div>';
        }
    }

    tooltip.innerHTML = html;
    tooltip.classList.add('visible');

    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - 8;

    if (left < 8) left = 8;
    if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = rect.bottom + 8;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function ocultarTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('visible');
}

// ============================================
// Validación
// ============================================

function validarFormulario(nombre, dni, diasDisponibles, fechaInicio, diasF1, fechaInicioF2, diasF2) {
    if (!nombre.trim()) {
        return 'El apellido y nombre son obligatorios.';
    }

    if (!dni.trim()) {
        return 'El DNI es obligatorio.';
    }

    if (!diasDisponibles || diasDisponibles < 1) {
        return 'Los días hábiles disponibles son obligatorios y deben ser al menos 1.';
    }

    if (!fechaInicio) {
        return 'La fecha de inicio de la primera franja es obligatoria.';
    }

    if (fechaInicio < FECHA_MINIMA || fechaInicio > FECHA_MAXIMA) {
        return 'Las fechas deben estar entre el 01/12/2026 y el 30/06/2027.';
    }

    if (diasF1 < 0) {
        return 'Los días de la primera franja no pueden ser negativos.';
    }

    if (fechaInicioF2 || diasF2 > 0) {
        if (!fechaInicioF2) {
            return 'Si completás días de la segunda franja, también necesitás la fecha de inicio.';
        }
        if (diasF2 <= 0) {
            return 'Si completás la fecha de la segunda franja, también necesitás los días hábiles.';
        }
        if (fechaInicioF2 < FECHA_MINIMA || fechaInicioF2 > FECHA_MAXIMA) {
            return 'Las fechas deben estar entre el 01/12/2026 y el 30/06/2027.';
        }
    }

    // Calcular días hábiles totales
    const calculado = calcularFranjas(fechaInicio, diasF1, fechaInicioF2, diasF2);
    const totalDias = calculado.franja1.length + calculado.franja2.length;

    // Validar que no se excedan los días disponibles
    if (totalDias > diasDisponibles) {
        return 'No podés tomar más días de los que tenés disponibles. Tenés ' + diasDisponibles + ' días y querés tomar ' + totalDias + '.';
    }

    return null;
}

// ============================================
// Lógica de la aplicación
// ============================================

function agregarEfectivo(nombre, dni, diasDisponibles, fechaInicio, diasF1, fechaInicioF2, diasF2) {
    const efectivos = cargarEfectivos();
    const calculado = calcularFranjas(fechaInicio, diasF1, fechaInicioF2, diasF2);

    const todosDias = calculado.franja1.concat(calculado.franja2);
    todosDias.sort();

    const nuevo = {
        id: Date.now(),
        nombre: nombre.trim(),
        dni: dni.trim(),
        diasDisponibles: diasDisponibles,
        fechaInicio: fechaInicio,
        dias: todosDias,
        franja1: calculado.franja1,
        franja2: calculado.franja2,
    };

    efectivos.push(nuevo);
    guardarEfectivos(efectivos);
}

function actualizarEfectivo(id, nombre, dni, diasDisponibles, fechaInicio, diasF1, fechaInicioF2, diasF2) {
    const efectivos = cargarEfectivos();
    let index = -1;

    for (let i = 0; i < efectivos.length; i++) {
        if (efectivos[i].id === id) {
            index = i;
            break;
        }
    }

    if (index === -1) return;

    const calculado = calcularFranjas(fechaInicio, diasF1, fechaInicioF2, diasF2);

    const todosDias = calculado.franja1.concat(calculado.franja2);
    todosDias.sort();

    efectivos[index].nombre = nombre.trim();
    efectivos[index].dni = dni.trim();
    efectivos[index].diasDisponibles = diasDisponibles;
    efectivos[index].fechaInicio = fechaInicio;
    efectivos[index].dias = todosDias;
    efectivos[index].franja1 = calculado.franja1;
    efectivos[index].franja2 = calculado.franja2;

    guardarEfectivos(efectivos);
}

function eliminarEfectivo(id) {
    const efectivos = cargarEfectivos();
    const nuevos = [];

    for (let i = 0; i < efectivos.length; i++) {
        if (efectivos[i].id !== id) {
            nuevos.push(efectivos[i]);
        }
    }

    guardarEfectivos(nuevos);
}

// ============================================
// Renderizado de la lista
// ============================================

function renderizarLista() {
    const lista = document.getElementById('lista');
    const efectivos = cargarEfectivos();

    if (efectivos.length === 0) {
        lista.innerHTML = '<p class="vacio">No hay efectivos registrados todavía.</p>';
        return;
    }

    // Ordenar alfabéticamente
    efectivos.sort(function(a, b) {
        return a.nombre.localeCompare(b.nombre, 'es');
    });

    let html = '';

    for (let i = 0; i < efectivos.length; i++) {
        const ef = efectivos[i];

        let diasSobrecargados = 0;
        for (let j = 0; j < ef.dias.length; j++) {
            if (contarEnDia(ef.dias[j], efectivos) > MAX_SIMULTANEAS) {
                diasSobrecargados++;
            }
        }
        const prohibido = diasSobrecargados > 0;

        const clase = prohibido ? 'prohibido' : '';
        const circulo = prohibido ? '<span class="circulo"></span>' : '';
        const badge = prohibido ? '<span class="badge">Prohibido</span>' : '';

        const finFranja1 = ef.franja1.length > 0 ? ef.franja1[ef.franja1.length - 1] : null;
        const finFranja2 = ef.franja2.length > 0 ? ef.franja2[ef.franja2.length - 1] : null;

        const diasUsados = ef.dias.length;
        const diasRestantes = ef.diasDisponibles - diasUsados;

        html += '<div class="efectivo ' + clase + '">';
        html += circulo;
        html += '<div class="info">';
        html += '<div class="nombre">' + ef.nombre + '</div>';
        html += '<div class="detalles">DNI: ' + ef.dni + ' · Disponibles: ' + ef.diasDisponibles + ' · Usados: ' + diasUsados + ' · Restantes: ' + diasRestantes + '</div>';
        html += '</div>';
        html += badge;
        html += '<button class="btn-detalles" data-id="' + ef.id + '">Detalles</button>';
        html += '<button class="btn-editar" data-id="' + ef.id + '">Editar</button>';
        html += '<button class="btn-eliminar" data-id="' + ef.id + '">Eliminar</button>';
        html += '</div>';

        // Panel de detalles
        html += '<div class="detalles-expandidos" id="detalles-' + ef.id + '">';
        html += '<h3>Detalle de licencia</h3>';
        html += '<div class="franja-info franja1">';
        html += '<div class="titulo">Primera franja</div>';
        html += '<div class="fechas">Inicio: ' + formatearFechaLegible(ef.fechaInicio) + ' · Fin: ' + formatearFechaLegible(finFranja1) + ' · ' + ef.franja1.length + ' días hábiles</div>';
        html += '</div>';

        if (ef.franja2.length > 0) {
            html += '<div class="franja-info franja2">';
            html += '<div class="titulo">Segunda franja</div>';
            html += '<div class="fechas">Inicio: ' + formatearFechaLegible(ef.franja2[0]) + ' · Fin: ' + formatearFechaLegible(finFranja2) + ' · ' + ef.franja2.length + ' días hábiles</div>';
            html += '</div>';
        }

        html += '<div class="franja-info" style="background: rgba(99, 179, 237, 0.1); border-left: 3px solid #63b3ed;">';
        html += '<div class="titulo" style="color: #63b3ed;">Resumen de días</div>';
        html += '<div class="fechas">Disponibles: ' + ef.diasDisponibles + ' · Usados: ' + diasUsados + ' · Restantes: ' + diasRestantes + '</div>';
        html += '</div>';

        html += '</div>';
    }

    lista.innerHTML = html;

    // Agregar eventos
    const botonesEliminar = lista.querySelectorAll('.btn-eliminar');
    for (let i = 0; i < botonesEliminar.length; i++) {
        botonesEliminar[i].addEventListener('click', function() {
            const id = parseInt(this.dataset.id, 10);
            const efectivos = cargarEfectivos();
            let ef = null;
            for (let j = 0; j < efectivos.length; j++) {
                if (efectivos[j].id === id) {
                    ef = efectivos[j];
                    break;
                }
            }
            const nombre = ef ? ef.nombre : '';
            const confirmacion = confirm('¿Estás seguro de que querés eliminar a ' + nombre + '?\n\nEsta acción no se puede deshacer.');
            if (confirmacion) {
                eliminarEfectivo(id);
                renderizarLista();
                renderizarCalendario();
            }
        });
    }

    const botonesEditar = lista.querySelectorAll('.btn-editar');
    for (let i = 0; i < botonesEditar.length; i++) {
        botonesEditar[i].addEventListener('click', function() {
            const id = parseInt(this.dataset.id, 10);
            cargarEfectivoEnFormulario(id);
        });
    }

    const botonesDetalles = lista.querySelectorAll('.btn-detalles');
    for (let i = 0; i < botonesDetalles.length; i++) {
        botonesDetalles[i].addEventListener('click', function() {
            const id = this.dataset.id;
            const detalles = document.getElementById('detalles-' + id);
            if (detalles) {
                detalles.classList.toggle('visible');
            }
        });
    }
}

// ============================================
// Listado exportable / imprimible
// ============================================

function abrirListado() {
    const modal = document.getElementById('modalListado');
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    const efectivos = cargarEfectivos();

    // Ordenar alfabéticamente
    efectivos.sort(function(a, b) {
        return a.nombre.localeCompare(b.nombre, 'es');
    });

    let html = '';

    for (let i = 0; i < efectivos.length; i++) {
        const ef = efectivos[i];

        const totalDias = ef.dias.length;
        const diasRestantes = ef.diasDisponibles - totalDias;

        let franja1Texto = '<span class="sin-franja">—</span>';
        if (ef.franja1.length > 0) {
            const inicio = formatearFechaLegible(ef.franja1[0]);
            const fin = formatearFechaLegible(ef.franja1[ef.franja1.length - 1]);
            franja1Texto = inicio + ' - ' + fin;
        }

        let franja2Texto = '<span class="sin-franja">—</span>';
        if (ef.franja2.length > 0) {
            const inicio = formatearFechaLegible(ef.franja2[0]);
            const fin = formatearFechaLegible(ef.franja2[ef.franja2.length - 1]);
            franja2Texto = inicio + ' - ' + fin;
        }

        let restantesClass = 'dias-restantes';
        if (diasRestantes === 0) {
            restantesClass = 'dias-agotados';
        }

        html += '<tr>';
        html += '<td>' + ef.nombre + '</td>';
        html += '<td>' + ef.diasDisponibles + '</td>';
        html += '<td>' + totalDias + '</td>';
        html += '<td class="' + restantesClass + '">' + diasRestantes + '</td>';
        html += '<td>' + franja1Texto + '</td>';
        html += '<td>' + franja2Texto + '</td>';
        html += '</tr>';
    }

    cuerpoTabla.innerHTML = html;
    modal.classList.add('visible');
}

function cerrarListado() {
    const modal = document.getElementById('modalListado');
    modal.classList.remove('visible');
}

function exportarCSV() {
    const efectivos = cargarEfectivos();

    // Ordenar alfabéticamente
    efectivos.sort(function(a, b) {
        return a.nombre.localeCompare(b.nombre, 'es');
    });

    let csv = 'Apellido y Nombre,Días disponibles,Días usados,Días restantes,1ª Franja (Inicio - Fin),2ª Franja (Inicio - Fin)\n';

    for (let i = 0; i < efectivos.length; i++) {
        const ef = efectivos[i];

        const totalDias = ef.dias.length;
        const diasRestantes = ef.diasDisponibles - totalDias;

        let franja1Texto = '—';
        if (ef.franja1.length > 0) {
            const inicio = formatearFechaLegible(ef.franja1[0]);
            const fin = formatearFechaLegible(ef.franja1[ef.franja1.length - 1]);
            franja1Texto = inicio + ' - ' + fin;
        }

        let franja2Texto = '—';
        if (ef.franja2.length > 0) {
            const inicio = formatearFechaLegible(ef.franja2[0]);
            const fin = formatearFechaLegible(ef.franja2[ef.franja2.length - 1]);
            franja2Texto = inicio + ' - ' + fin;
        }

        csv += '"' + ef.nombre + '",' + ef.diasDisponibles + ',' + totalDias + ',' + diasRestantes + ',"' + franja1Texto + '","' + franja2Texto + '"\n';
    }

    // Crear archivo y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'listado_efectivos_etac.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function imprimirListado() {
    window.print();
}

// ============================================
// Edición de efectivos
// ============================================

function cargarEfectivoEnFormulario(id) {
    const efectivos = cargarEfectivos();
    let ef = null;

    for (let i = 0; i < efectivos.length; i++) {
        if (efectivos[i].id === id) {
            ef = efectivos[i];
            break;
        }
    }

    if (!ef) return;

    editandoId = id;

    document.getElementById('nombre').value = ef.nombre;
    document.getElementById('dni').value = ef.dni;
    document.getElementById('diasDisponibles').value = ef.diasDisponibles;
    document.getElementById('fechaInicio').value = ef.fechaInicio;
    document.getElementById('diasFranja1').value = ef.franja1.length;

    if (ef.franja2.length > 0) {
        document.getElementById('fechaInicioFranja2').value = ef.franja2[0];
        document.getElementById('diasFranja2').value = ef.franja2.length;
    } else {
        document.getElementById('fechaInicioFranja2').value = '';
        document.getElementById('diasFranja2').value = '';
    }

    document.getElementById('formTitulo').textContent = 'Editar efectivo';
    document.getElementById('btnSubmit').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'block';

    renderizarCalendario();

    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicion() {
    editandoId = null;

    document.getElementById('nombre').value = '';
    document.getElementById('dni').value = '';
    document.getElementById('diasDisponibles').value = '';
    document.getElementById('fechaInicio').value = '2026-12-01';
    document.getElementById('diasFranja1').value = '';
    document.getElementById('fechaInicioFranja2').value = '2027-02-01';
    document.getElementById('diasFranja2').value = '';

    document.getElementById('formTitulo').textContent = 'Registrar efectivo';
    document.getElementById('btnSubmit').textContent = 'Añadir efectivo';
    document.getElementById('btnCancelar').style.display = 'none';

    renderizarCalendario();
}

function mostrarMensaje(texto, tipo) {
    const msg = document.getElementById('mensaje');
    msg.textContent = texto;
    msg.className = 'mensaje ' + tipo;

    setTimeout(function() {
        msg.className = 'mensaje';
    }, 5000);
}

// ============================================
// Inicialización
// ============================================

function init() {
    document.getElementById('fechaInicio').value = '2026-12-01';
    document.getElementById('fechaInicioFranja2').value = '2027-02-01';

    mesMostrado = new Date(2026, 11, 1);

    document.getElementById('mesAnterior').addEventListener('click', function() {
        mesMostrado.setMonth(mesMostrado.getMonth() - 1);
        renderizarCalendario();
    });

    document.getElementById('mesSiguiente').addEventListener('click', function() {
        mesMostrado.setMonth(mesMostrado.getMonth() + 1);
        renderizarCalendario();
    });

    const campos = ['fechaInicio', 'diasFranja1', 'fechaInicioFranja2', 'diasFranja2'];
    for (let i = 0; i < campos.length; i++) {
        document.getElementById(campos[i]).addEventListener('input', renderizarCalendario);
    }

    document.getElementById('btnCancelar').addEventListener('click', cancelarEdicion);

    // Eventos del listado
    document.getElementById('btnListado').addEventListener('click', abrirListado);
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarListado);
    document.getElementById('btnExportar').addEventListener('click', exportarCSV);
    document.getElementById('btnImprimir').addEventListener('click', imprimirListado);

    // Cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarListado();
        }
    });

    document.getElementById('vacationForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const dni = document.getElementById('dni').value;
        const diasDisponibles = parseInt(document.getElementById('diasDisponibles').value, 10) || 0;
        const fechaInicio = document.getElementById('fechaInicio').value;
        const diasF1 = parseInt(document.getElementById('diasFranja1').value, 10) || 0;
        const fechaInicioF2 = document.getElementById('fechaInicioFranja2').value;
        const diasF2 = parseInt(document.getElementById('diasFranja2').value, 10) || 0;

        const error = validarFormulario(nombre, dni, diasDisponibles, fechaInicio, diasF1, fechaInicioF2, diasF2);

        if (error) {
            mostrarMensaje(error, 'error');
            return;
        }

        if (editandoId !== null) {
            actualizarEfectivo(editandoId, nombre, dni, diasDisponibles, fechaInicio, diasF1, fechaInicioF2, diasF2);
            mostrarMensaje('Efectivo actualizado correctamente.', 'exito');
            cancelarEdicion();
        } else {
            agregarEfectivo(nombre, dni, diasDisponibles, fechaInicio, diasF1, fechaInicioF2, diasF2);
            mostrarMensaje('Efectivo registrado correctamente.', 'exito');

            document.getElementById('nombre').value = '';
            document.getElementById('dni').value = '';
            document.getElementById('diasDisponibles').value = '';
            document.getElementById('fechaInicio').value = '2026-12-01';
            document.getElementById('diasFranja1').value = '';
            document.getElementById('fechaInicioFranja2').value = '2027-02-01';
            document.getElementById('diasFranja2').value = '';
        }

        renderizarLista();
        renderizarCalendario();
    });

    renderizarCalendario();
    renderizarLista();
}

document.addEventListener('DOMContentLoaded', init);
