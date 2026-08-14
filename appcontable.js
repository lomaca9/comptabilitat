let bancoPreguntas = null;
let preguntasPartida = [];
let indiceActual = 0;
let contadorAciertos = 0;
let contadorErrores = 0;

// Cargar los datos desde el archivo JSON al iniciar
window.onload = async () => {
    try {
        const respuesta = await fetch('contable.json');
        bancoPreguntas = await respuesta.json();
    } catch (error) {
        alert('Error crítico al cargar el banco de preguntas. Asegúrate de ejecutar el archivo mediante un servidor local o revisar la sintaxis JSON.');
        console.error(error);
    }
};

// Arranca el juego filtrando y seleccionando las variantes
function iniciarJuego(categoria) {
    if (!bancoPreguntas) return;

    const poolPreguntas = bancoPreguntas[categoria];
    preguntasPartida = filtrarYMezclarPorBloques(poolPreguntas);
    
    indiceActual = 0;
    contadorAciertos = 0;
    contadorErrores = 0;

// AÑADE ESTAS DOS LÍNEAS PARA REINICIAR EL MARCADOR VISUAL
    document.getElementById('vivo-aciertos').innerText = '0';
    document.getElementById('vivo-errores').innerText = '0';

    document.getElementById('pantalla-inicio').classList.add('oculto');
    document.getElementById('pantalla-resultados').classList.add('oculto');
    document.getElementById('pantalla-test').classList.remove('oculto');

    mostrarPregunta();
}

// Algoritmo para evitar repetir preguntas del mismo bloque temático en la misma partida
function filtrarYMezclarPorBloques(lista) {
    // Agrupar preguntas por el nombre de su bloque
    const grupos = {};
    lista.forEach(p => {
        if (!grupos[p.bloque]) grupos[p.bloque] = [];
        grupos[p.bloque].push(p);
    });

    const seleccionadas = [];
    // De cada bloque temático, extraemos solo UNA variante al azar para esta partida
    for (const bloque in grupos) {
        const variantes = grupos[bloque];
        const eleccionAlAzar = variantes[Math.floor(Math.random() * variantes.length)];
        seleccionadas.push(eleccionAlAzar);
    }

    // Barajar el cuestionario final resultante
    return seleccionadas.sort(() => Math.random() - 0.5);
}

// Renderizar la pregunta y mezclar las respuestas
function mostrarPregunta() {
    document.getElementById('btn-siguiente').classList.add('oculto');
    
    const datosPregunta = preguntasPartida[indiceActual];
    
    // Actualizar datos de progreso
    document.getElementById('info-progreso').innerText = `Pregunta ${indiceActual + 1} de ${preguntasPartida.length}`;
    const porcentajeProgreso = ((indiceActual) / preguntasPartida.length) * 100;
    document.getElementById('linea-progreso').style.width = `${porcentajeProgreso}%`;

    // Escribir enunciados
    document.getElementById('etiqueta-bloque').innerText = datosPregunta.bloque;
    document.getElementById('texto-pregunta').innerText = datosPregunta.pregunta;

    // Guardamos la respuesta correcta original
    const textoCorrecto = datosPregunta.opciones[datosPregunta.correcta];

    // Mapear opciones y barajarlas para que no se memorice su posición en pantalla
    const opcionesEstructuradas = datosPregunta.opciones.map(texto => ({
        texto: texto,
        esCorrecta: texto === textoCorrecto
    }));

    opcionesEstructuradas.sort(() => Math.random() - 0.5);

    // Renderizar los botones de las opciones en el DOM
    const contenedor = document.getElementById('contenedor-opciones');
    contenedor.innerHTML = '';

    opcionesEstructuradas.forEach(opcion => {
        const boton = document.createElement('button');
        boton.className = 'btn-opcion';
        boton.innerText = opcion.texto;
        boton.onclick = () => verificarRespuesta(boton, opcion.esCorrecta);
        contenedor.appendChild(boton);
    });
}

// Evaluar la opción seleccionada por el alumno
function verificarRespuesta(botonSeleccionado, esCorrecta) {
    const todosLosBotones = document.querySelectorAll('.btn-opcion');
    
    // Desactivar todos los botones para que el alumno no pueda cambiar su opción elegida
    todosLosBotones.forEach(btn => btn.disabled = true);

    if (esCorrecta) {
        botonSeleccionado.classList.add('correcta');
        contadorAciertos++;
	document.getElementById('vivo-aciertos').innerText = contadorAciertos;
    } else {
        botonSeleccionado.classList.add('incorrecta');
        contadorErrores++;
        document.getElementById('vivo-errores').innerText = contadorErrores;

        // Mostrar visualmente al alumno cuál era la respuesta correcta
        todosLosBotones.forEach(btn => {
            if (btn.innerText === preguntasPartida[indiceActual].opciones[preguntasPartida[indiceActual].correcta]) {
                btn.classList.add('correcta');
            }
        });
    }

    document.getElementById('btn-siguiente').classList.remove('oculto');
}

// Pasar a la siguiente fase o finalizar la evaluación
function siguientePregunta() {
    indiceActual++;
    if (indiceActual < preguntasPartida.length) {
        mostrarPregunta();
    } else {
        finalizarEvaluacion();
    }
}

// Mostrar los resultados y calcular la nota en base 10
function finalizarEvaluacion() {
    document.getElementById('pantalla-test').classList.add('oculto');
    document.getElementById('pantalla-resultados').classList.remove('oculto');

    document.getElementById('aciertos').innerText = contadorAciertos;
    document.getElementById('errores').innerText = contadorErrores;

    // Cálculo dinámico de la nota proporcional
    const nota = (contadorAciertos / preguntasPartida.length) * 10;
    document.getElementById('nota-num').innerText = nota.toFixed(2);
}

function volverAlInicio() {
    document.getElementById('pantalla-resultados').classList.add('oculto');
    document.getElementById('pantalla-inicio').classList.remove('oculto');
}
