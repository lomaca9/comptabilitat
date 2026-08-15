let bancoPreguntas = null;
let preguntasPartida = [];
let indiceActual = 0;
let contadorAciertos = 0;
let contadorErrores = 0;

// Cantidad de preguntas que quieres que tenga cada partida (puedes cambiar este número)
const TOTAL_PREGUNTAS_PARTIDA = 10;

// Arranca el juego cargando el JSON correspondiente (siempre contable.json)
async function iniciarJuego(categoria) {
    const archivoALeer = 'contable.json';

    try {
        const respuesta = await fetch(archivoALeer);
        if (!respuesta.ok) {
            throw new Error(`Error en servidor: ${respuesta.status} ${respuesta.statusText}`);
        }
        bancoPreguntas = await respuesta.json();
    } catch (error) {
        alert(`Error crítico al cargar el archivo ${archivoALeer}. Revisa que el nombre esté estrictamente en minúsculas en GitHub y no contenga comentarios.`);
        console.error(error);
        return;
    }

    const poolPreguntas = bancoPreguntas[categoria];
    if (!poolPreguntas) {
        alert(`Error: No se encontró la categoría "${categoria}" dentro del archivo JSON.`);
        return;
    }

    // NUEVA LÓGICA: Baraja todas las preguntas y selecciona una cantidad fija
    preguntasPartida = prepararPreguntasAleatorias(poolPreguntas, TOTAL_PREGUNTAS_PARTIDA);
    
    // Resetear estados
    indiceActual = 0;
    contadorAciertos = 0;
    contadorErrores = 0;

    // Resetear marcadores visuales del HTML
    document.getElementById('vivo-aciertos').innerText = '0';
    document.getElementById('vivo-errores').innerText = '0';

    // Transición de pantallas
    document.getElementById('pantalla-inicio').classList.add('oculto');
    document.getElementById('pantalla-resultados').classList.add('oculto');
    document.getElementById('pantalla-test').classList.remove('oculto');

    mostrarPregunta();
}

// Nueva función simplificada que reemplaza a la de los bloques
function prepararPreguntasAleatorias(lista, cantidadMaxima) {
    // 1. Barajamos toda la lista de preguntas completa de forma aleatoria
    const listaBarajada = [...lista].sort(() => Math.random() - 0.5);
    
    // 2. Recortamos para quedarnos solo con el número de preguntas configurado
    // Si el JSON tiene menos preguntas que el máximo, se queda con todas las disponibles
    return listaBarajada.slice(0, Math.min(cantidadMaxima, listaBarajada.length));
}

// Renderizar la pregunta en pantalla y mezclar las opciones
function mostrarPregunta() {
    document.getElementById('btn-siguiente').classList.add('oculto');
    
    const datosPregunta = preguntasPartida[indiceActual];
    
    // Progreso
    document.getElementById('info-progreso').innerText = `Pregunta ${indiceActual + 1} de ${preguntasPartida.length}`;
    const porcentajeProgreso = (indiceActual / preguntasPartida.length) * 100;
    document.getElementById('linea-progreso').style.width = `${porcentajeProgreso}%`;

    // Enunciado
    document.getElementById('texto-pregunta').innerText = datosPregunta.pregunta;

    // Guardar texto de la respuesta correcta original
    const textoCorrecto = datosPregunta.opciones[datosPregunta.correcta];

    // Estructurar opciones para desordenarlas sin perder cuál es la correcta
    const opcionesEstructuradas = datosPregunta.opciones.map(texto => ({
        texto: texto,
        esCorrecta: texto === textoCorrecto
    }));

    opcionesEstructuradas.sort(() => Math.random() - 0.5);

    // Inyectar botones en el DOM
    const contenedor = document.getElementById('contenedor-opciones');
    contenedor.innerHTML = '';

    opcionesEstructuradas.forEach(opcion => {
        const boton = document.createElement('button');
        boton.className = 'btn-opcion';
        boton.innerText = opcion.texto;
        boton.onclick = () => verificarRespuesta(boton, opcion.esCorrecta, textoCorrecto);
        contenedor.appendChild(boton);
    });
}

// Validar la respuesta pulsada por el alumno
function verificarRespuesta(botonSeleccionado, esCorrecta, textoCorrecto) {
    const todosLosBotones = document.querySelectorAll('.btn-opcion');
    
    // Deshabilitar todas las opciones tras pulsar una
    todosLosBotones.forEach(btn => btn.disabled = true);

    if (esCorrecta) {
        botonSeleccionado.classList.add('correcta');
        contadorAciertos++;
        document.getElementById('vivo-aciertos').innerText = contadorAciertos;
    } else {
        botonSeleccionado.classList.add('incorrecta');
        contadorErrores++;
        document.getElementById('vivo-errores').innerText = contadorErrores;

        // Mostrar cuál era la respuesta correcta marcándola en verde
        todosLosBotones.forEach(btn => {
            if (btn.innerText === textoCorrecto) {
                btn.classList.add('correcta');
            }
        });
    }

    // Mostrar el botón de siguiente
    document.getElementById('btn-siguiente').classList.remove('oculto');
}

// Avanzar en el cuestionario
function siguientePregunta() {
    indiceActual++;
    if (indiceActual < preguntasPartida.length) {
        mostrarPregunta();
    } else {
        finalizarEvaluacion();
    }
}

// Mostrar pantalla de resultados y calcular nota
function finalizarEvaluacion() {
    document.getElementById('pantalla-test').classList.add('oculto');
    document.getElementById('pantalla-resultados').classList.remove('oculto');

    document.getElementById('aciertos').innerText = contadorAciertos;
    document.getElementById('errores').innerText = contadorErrores;

    // Nota matemática final sobre 10
    const nota = (contadorAciertos / preguntasPartida.length) * 10;
    document.getElementById('nota-num').innerText = nota.toFixed(2);
}

// Volver a la pantalla de selección
function volverAlInicio() {
    document.getElementById('pantalla-resultados').classList.add('oculto');
    document.getElementById('pantalla-inicio').classList.remove('oculto');
}
