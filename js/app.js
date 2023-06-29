// ******* SELECTORES Y VARIABLES *******

// Objeto general que incluirá la mesa, la hora y el pedido del cliente
let cliente = {
  mesa: "",
  hora: "",
  pedido: [],
};

// Objeta que cambia el ID de la categoría por la clase de alimento
const categorias = {
  1: "Comida",
  2: "Bebidas",
  3: "Postres",
};

// **************************************************

// Selector del boton de Crear Orden en el Modal
const btnGuardarCliente = document.querySelector("#guardar-cliente");

// ******* EVENT LISTENERS *******

// Cuando se hace click, se ejecuta la funcion que inicia el guardado del cliente
btnGuardarCliente.addEventListener("click", guardarCliente);

// ******* FUNCIONES *******

// Funcion que va a guardar los datos del cliente
function guardarCliente() {
  // Selectores de los campos del modal
  const hora = document.querySelector("#hora").value;
  const mesa = document.querySelector("#mesa").value;

  // Comprobar si hay campos vacíos
  const camposVaciosComprobacion = [hora, mesa].some((campo) => campo === "");

  // Si uno está vacío, usamos la funcion de mostrarAlerta
  if (camposVaciosComprobacion) {
    mostrarAlerta("Ambos campos son obligatorios");
    return;
  }

  // Si pasa la validación, asignamos los datos del formulario al cliente
  // Pasamos primero una copia del cliente completo y luego los nuevos datos,
  // para que no se encimen al final y se reinicie de nuevo

  cliente = { ...cliente, mesa, hora };
  // console.log(cliente)

  // Ocultamos ya el modal
  // Seleccionamos el ID del modal
  const modalFormulario = document.querySelector("#formulario");
  // Creamos una nueva instancia de un Modal de bootstrap y le pasamos la instancia
  // de nuestro modal
  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  // Ocultamos el modal mediante el uso del método .hide()
  modalBootstrap.hide();

  // Mostrar las secciones de platos y resumen
  mostrarSecciones();

  // Obtener platos desde la API de Json Server
  obtenerPlatos();
}

// **************************************************

// Funcion que muestra la alerta de error
function mostrarAlerta(mensaje) {
  // Comprobamos si ya existe una alerta con esa clase
  const existeAlerta = document.querySelector(".invalid-feedback");

  // Si no existe, la creamos y la inyectamos despues del form
  if (!existeAlerta) {
    const alerta = document.createElement("DIV");
    alerta.classList.add("invalid-feedback", "d-block", "text-center");
    alerta.textContent = mensaje;
    document.querySelector(".modal-body form").appendChild(alerta);

    // Lo eliminamos despues de 3 segundos
    setTimeout(() => {
      alerta.remove();
    }, 3000);
  }
}

// **************************************************

// Funcion para mostrar las secciones ocultas despues del modal
function mostrarSecciones() {
  // Seleccionamos todos los elementos que tengan esta clase
  const seccionesOcultas = document.querySelectorAll(".d-none");

  // Recorremos el Node Module y a cada elemento/seccion le quitamos la clase para que se muestre
  seccionesOcultas.forEach((seccion) => {
    seccion.classList.remove("d-none");
  });
}

// **************************************************

// Funcion que trae los platos disponibles de la API
function obtenerPlatos() {
  const url = "http://localhost:4000/platillos";

  fetch(url)
    .then((response) => response.json())
    .then((resolve) => mostrarPlatos(resolve))
    .catch((error) => console.log(error));
}

// **************************************************

// Funcion que muestra los platos y los inyecta en el contenido
function mostrarPlatos(platos) {
  //Seleccionamos el contenido que va a incluir los platos disponibles
  const contenido = document.querySelector("#platillos .contenido");

  // Recorremos el array de los platos
  platos.forEach((plato) => {
    // Extraemos cada elemento de cada plato
    const { id, nombre, precio, categoria } = plato;
    // Creamos un div con el row de Bootstrap y le añadimos las clases
    const row = document.createElement("div");
    row.classList.add("row", "py-3", "border-top");

    // Creamos el DIV con las clases que va a incluir el nombre
    const nombrePlato = document.createElement("div");
    nombrePlato.classList.add("col-md-4");
    nombrePlato.textContent = nombre;

    // Creamos el DIV con las clases que va a incluir el precio
    const precioPlato = document.createElement("div");
    precioPlato.classList.add("col-md-3", "fw-bold");
    precioPlato.textContent = `${precio}€`;

    // Creamos el DIV con las clases que va a incluir la categoria
    const categoriaPlato = document.createElement("div");
    categoriaPlato.classList.add("col-md-3");
    categoriaPlato.textContent = categorias[categoria];

    // Creamos el INPUT para la cantidad
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number"; // Añadimos el tipo de dato que va a llevar
    inputCantidad.min = 0; // Añadimos el minimo posible
    inputCantidad.value = 0; // Añadimos su value inicial
    inputCantidad.id = `producto-${id}`; // Añadimos su id
    inputCantidad.classList.add("form-control"); // Añadimos la clase de Bootstrap para inputs

    // Funcion que detecta la cantidad y el plato elegido que se esta agregando,
    // cuando cambia el input con la cantidad
    inputCantidad.onchange = () => {
      // Creamos la variable que incluye la cantidad,
      // convirtiendo el dato a numero para poder
      // multiplicarlo despues por el precio
      const cantidad = parseInt(inputCantidad.value);
      // Usamos la funcion de agregarPlato y le pasamos una copia
      // del objeto general de plato, con el dato de la cantidad ya añadido
      agregarPlato({ ...plato, cantidad });
    };

    // Creamos un div para inyectar el input de cantidad
    const agregar = document.createElement("DIV");
    agregar.classList.add("col-md-2");
    agregar.appendChild(inputCantidad);

    // Inyectamos cada elemento al DIV de row
    row.appendChild(nombrePlato);
    row.appendChild(precioPlato);
    row.appendChild(categoriaPlato);
    row.appendChild(agregar);

    // Inyectamos el Row con los elementos al div de contenido
    contenido.appendChild(row);
  });
}

// **************************************************

// Funcion que agrega los platos al objeto general del cliente
function agregarPlato(pedidoCliente) {
  // Extraemos el array del pedido del objeto general
  let { pedido } = cliente;

  // Revisar que la cantidad sea mayor a 0
  if (pedidoCliente.cantidad > 0) {
    // Comprobamos si ya existe el elemento en el array del pedido del cliente
    if (pedido.some((articulo) => articulo.id === pedidoCliente.id)) {
      // Actualizamos la cantidad:

      // 1º - Creamos un nuevo array con el pedido actualizado (las cantidades)
      // 2º - Si el ID de algun articulo del array es igual, modificamos la cantidad
      // 3º - IMPORTANTE - Retornamos el articulo a pedidoClienteActualizado
      const pedidoClienteActualizado = pedido.map((articulo) => {
        if (articulo.id === pedidoCliente.id) {
          articulo.cantidad = pedidoCliente.cantidad;
        }
        return articulo;
      });
      // 4º - Se asigna el nuevo array (Una copia de pedidoClienteActualizado) al
      // objeto general de cliente.pedido
      cliente.pedido = [...pedidoClienteActualizado];
    } else {
      // Añadimos al objeto general, en el campo de pedido, el pedido actual
      // Creamos una copia del array de pedido actual y le pasamos el pedido del cliente
      cliente.pedido = [...pedido, pedidoCliente];
    }
  } else {
    // Eliminar elementos cuando la cantidad es 0

    // Creamos un nuevo array (resultado) filtrando los
    const resultado = pedido.filter(
      (articulo) => articulo.id !== pedidoCliente.id
    );

    // Añadimos al objeto general el nuevo resultado, con los articulos filtrados
    cliente.pedido = [...resultado];
  }

  // Limpiar el html previo
  limpiarHTML();

  if (cliente.pedido.length) {
    // Mostrar el resumen del pedido
    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }
}

// **************************************************

// Funcion para mostrar el resumen del pedido
function actualizarResumen() {
  // Seleccionamos el div con el id "resumen" y la clase "contenido"
  const contenido = document.querySelector("#resumen .contenido");

  // Creamos un div llamado resumen y le añadimos la clase
  const resumen = document.createElement("DIV");
  resumen.classList.add("col-md-6", "card", "py-5", "px-3", "shadow");

  // Creamos los datos de la Mesa
  const mesa = document.createElement("p");
  mesa.textContent = "Mesa: ";
  mesa.classList.add("fw-bold");

  // Creamos el span que va a recibir el numero de mesa desde el objeto creado del pedido
  const mesaSpan = document.createElement("span");
  mesaSpan.textContent = cliente.mesa;
  mesa.classList.add("fw-normal");

  // Creamos los datos de la Hora
  const hora = document.createElement("p");
  hora.textContent = "Hora: ";
  hora.classList.add("fw-bold");

  // Creamos el span que va a recibir la hora desde el objeto creado del pedido
  const horaSpan = document.createElement("span");
  horaSpan.textContent = cliente.hora;
  hora.classList.add("fw-normal");

  // Agregar al elemento padre
  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  // Titulo de la seccion
  const heading = document.createElement("H3");
  heading.textContent = `Platos de la Mesa Nº${cliente.mesa}`;
  heading.classList.add("my-4", "text-center");

  // Creamos una lista donde iran los platos
  const grupo = document.createElement("UL");
  grupo.classList.add("list-group");

  // Extraemos el array del pedido con los platos del objeto general
  const { pedido } = cliente;

  // Recorremos el array de pedidos
  pedido.forEach((articulo) => {
    // Extraemos cada campo de cada articulo en la lista
    const { nombre, cantidad, precio, id } = articulo;

    // Creamos un LI
    const lista = document.createElement("LI");
    lista.classList.add("list-group-item");

    // Creamos un h4 con el nombre del plato
    const nombreArticulo = document.createElement("h4");
    nombreArticulo.classList.add("my-4", "text-center", "fw-bold");
    nombreArticulo.textContent = nombre;

    // Creamos un parrafo donde inyectaremos el span con el precio de cada artículo
    const precioArticulo = document.createElement("P");
    precioArticulo.classList.add("fw-bold");
    precioArticulo.textContent = `Precio: `;

    // Creamos un span con el precio de cada artículo
    const precioSpan = document.createElement("span");
    precioSpan.classList.add("fw-normal");
    precioSpan.textContent = `${precio}€/u`;

    // Creamos un parrafo donde inyectaremos el span con la cantidad de cada artículo
    const cantidadArticulo = document.createElement("P");
    cantidadArticulo.classList.add("fw-bold");
    cantidadArticulo.textContent = `Cantidad: `;

    // Creamos un span con la cantidad de cada artículo
    const cantidadSpan = document.createElement("span");
    cantidadSpan.classList.add("fw-normal");
    cantidadSpan.textContent = cantidad;

    // Creamos un parrafo con el subtotal, multiplicando cantidad * precio
    const totalArticulo = document.createElement("P");
    totalArticulo.classList.add("fw-bold");
    totalArticulo.textContent = `Subtotal a Pagar: `;

    // Creamos un span con el subtotal, usando la funcion de calcularSubtotal()
    const totalSpan = document.createElement("span");
    totalSpan.classList.add("fw-normal");
    totalSpan.textContent = calcularSubtotal(precio, cantidad);

    // Boton para eliminar articulo de la lista
    const btnEliminar = document.createElement("button");
    btnEliminar.classList.add("btn", "btn-danger");
    btnEliminar.textContent = `Eliminar`;

    // Funcion de eliminar del pedido
    btnEliminar.onclick = () => {
      eliminarProducto(id);
    };

    // Inyectamos el span al parrafo de la cantidad
    cantidadArticulo.appendChild(cantidadSpan);
    precioArticulo.appendChild(precioSpan);
    totalArticulo.appendChild(totalSpan);

    // Agregar Articulos al LI
    lista.appendChild(nombreArticulo);
    lista.appendChild(precioArticulo);
    lista.appendChild(cantidadArticulo);
    lista.appendChild(totalArticulo);
    lista.appendChild(btnEliminar);

    // Agregar lista al grupo principal
    grupo.appendChild(lista);
  });

  // Agregar al contenido
  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(heading);

  // Agregamos el listado de platos
  resumen.appendChild(grupo);

  // Agregamos el resumen al div del contenido
  contenido.appendChild(resumen);

  // Mostar formulario de propinas, despues de haber añadido todo al resumen
  formularioPropinas();
}

// **************************************************

// Funcion que limpia el html precio del contenido
function limpiarHTML() {
  // Seleccionamos el contenido
  const contenido = document.querySelector("#resumen .contenido");

  // Si hay algo previo, se elimina
  while (contenido.firstChild) {
    contenido.removeChild(contenido.firstChild);
  }
}

// **************************************************

// Funcion para calcular el subtotal y mandarlo ya formateado con la moneda
function calcularSubtotal(precio, cantidad) {
  return `${precio * cantidad}€`;
}

// **************************************************

// Funcionalidad del boton que elimina los articulos del pedido y limpia el html de resumen
function eliminarProducto(id) {
  const { pedido } = cliente;
  const resultado = pedido.filter((articulo) => articulo.id !== id);
  cliente.pedido = [...resultado];

  // Limpiamos el html
  limpiarHTML();

  if (cliente.pedido.length) {
    // Actualizamos el HTML con el resumen
    actualizarResumen();
  }

  // Reiniciamos el resumen
  mensajePedidoVacio();

  // Se reinicia el input despues de eliminarlo

  // Selector dinamico del input del producto seleccionado
  const productoEliminado = `#producto-${id}`;
  // Seleccionamos el input escogido para elimnar
  const inputElementoEliminado = document.querySelector(productoEliminado);
  // Lo reseteamos a 0 en su value
  inputElementoEliminado.value = 0;
}

// **************************************************

// Funcion que reinicia el resumen cuando queda vacio
function mensajePedidoVacio() {
  const contenido = document.querySelector("#resumen .contenido");

  const texto = document.createElement("P");
  texto.classList.add("text-center");
  texto.textContent = "Añade los elementos del pedido";

  contenido.appendChild(texto);
}

// **************************************************

// Formulario que muestra el div de propinas
function formularioPropinas() {
  // Seleccionamos el contenido
  const contenido = document.querySelector("#resumen .contenido");

  // Creamos un div para añadir todo
  const formulario = document.createElement("DIV");
  formulario.classList.add("col-md-6", "formulario");

  // Creamos un subdiv para poder separar los elementos
  const divFormulario = document.createElement("DIV");
  divFormulario.classList.add("card", "py-5", "px-3", "shadow");

  // Creamos el heading
  const heading = document.createElement("h3");
  heading.classList.add("my-4", "text-center");
  heading.textContent = "Propina";

  // Radio Buttons para las propinas

  // 10%

  // 1º - Creamos un input de tipo radio con el name de 'propina', el valor que va a tener y su clase de Bootstrap
  const radio10 = document.createElement("INPUT");
  radio10.type = "radio";
  radio10.name = "propina";
  radio10.value = "10";
  radio10.classList.add("form-check-input");

  // 2º - Creamos el label que acompañará al radio button
  const radio10Label = document.createElement("LABEL");
  radio10Label.textContent = "10%";
  radio10Label.classList.add("form-check-label");

  // 3º - Creamos el div que contendrá radio button
  const radio10Div = document.createElement("DIV");
  radio10Div.classList.add("form-check");

  // 4º - Inyectamos el input y el label al div
  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10Label);

  // 5º - Calculamos el total, inbcluyendo el porcentaje de la propina
  radio10.onclick = calcularPropina;

  // 25%

  // 1º - Creamos un input de tipo radio con el name de 'propina', el valor que va a tener y su clase de Bootstrap
  const radio25 = document.createElement("INPUT");
  radio25.type = "radio";
  radio25.name = "propina";
  radio25.value = "25";
  radio25.classList.add("form-check-input");

  // 2º - Creamos el label que acompañará al radio button
  const radio25Label = document.createElement("LABEL");
  radio25Label.textContent = "25%";
  radio25Label.classList.add("form-check-label");

  // 3º - Creamos el div que contendrá radio button
  const radio25Div = document.createElement("DIV");
  radio25Div.classList.add("form-check");

  // 4º - Inyectamos el input y el label al div
  radio25Div.appendChild(radio25);
  radio25Div.appendChild(radio25Label);

  // 5º - Calculamos el total, inbcluyendo el porcentaje de la propina
  radio25.onclick = calcularPropina;

  // 50%

  // 1º - Creamos un input de tipo radio con el name de 'propina', el valor que va a tener y su clase de Bootstrap
  const radio50 = document.createElement("INPUT");
  radio50.type = "radio";
  radio50.name = "propina";
  radio50.value = "50";
  radio50.classList.add("form-check-input");

  // 2º - Creamos el label que acompañará al radio button
  const radio50Label = document.createElement("LABEL");
  radio50Label.textContent = "50%";
  radio50Label.classList.add("form-check-label");

  // 3º - Creamos el div que contendrá radio button
  const radio50Div = document.createElement("DIV");
  radio50Div.classList.add("form-check");

  // 4º - Inyectamos el input y el label al div
  radio50Div.appendChild(radio50);
  radio50Div.appendChild(radio50Label);

  // 5º - Calculamos el total, inbcluyendo el porcentaje de la propina
  radio50.onclick = calcularPropina;

  // Lo agregamos todo a sus elementos padres
  divFormulario.appendChild(heading);
  divFormulario.appendChild(radio10Div);
  divFormulario.appendChild(radio25Div);
  divFormulario.appendChild(radio50Div);
  formulario.appendChild(divFormulario);

  // Agregamos el formulario al contenido
  contenido.appendChild(formulario);
}

// **************************************************

// Funciona que calcula el total, sumando subtotal y propina
function calcularPropina() {
  // Extraemos el array del pedido del objeto general
  const { pedido } = cliente;

  // Inicializamos el subtotal
  let subtotal = 0;

  // Recorremos el array de pedidos y añadimos al subtotal el resultado
  // de multiplicar el precio por la cantidad
  pedido.forEach((articulo) => {
    subtotal += articulo.cantidad * articulo.precio;
  });

  // Seleccionamos el value del input con la propina elegida
  const propinaSeleccionada = document.querySelector(
    '[name="propina"]:checked'
  ).value;

  // Creamos una variable con la propina calculada sobre el subtotal
  const propina = (subtotal * parseInt(propinaSeleccionada)) / 100;

  // calculamos el total a pagar
  const total = subtotal + propina;

  // Lanzamos la funcion que muestra los totales ya al terminar
  mostrarTotalHTML(subtotal, total, propina);
}

// **************************************************

// Funcion que imprime el subtotal, la propina y el total en pantalla
function mostrarTotalHTML(subtotal, total, propina) {

  // Creamos un div para contener los 3 elementos
  const divTotales = document.createElement("DIV");
  divTotales.classList.add("total-pagar");

  // Subtotal párrafo
  const subtotalParrafo = document.createElement("P");
  subtotalParrafo.classList.add("fs-4", 'text-center', "fw-bold", "mt-5");
  subtotalParrafo.textContent = "Subtotal: ";

  // Subtotal Span
  const subtotalSpan = document.createElement("SPAN");
  subtotalSpan.classList.add("fw-normal");
  subtotalSpan.textContent = `${subtotal}€`;

  // Inyectamos el span al parrafo
  subtotalParrafo.appendChild(subtotalSpan);

  // Propina párrafo
  const propinaParrafo = document.createElement("P");
  propinaParrafo.classList.add("fs-4", 'text-center', "fw-bold", "mt-5");
  propinaParrafo.textContent = "Propina: ";

  // Propina Span
  const propinaSpan = document.createElement("SPAN");
  propinaSpan.classList.add("fw-normal");
  propinaSpan.textContent = `${propina}€`;

  // Inyectamos la propina al parrafo
  propinaParrafo.appendChild(propinaSpan);

  // Subtotal Parrafo
  const totalParrafo = document.createElement("P");
  totalParrafo.classList.add("fs-2", "fw-bold", "mt-5", 'text-center');
  totalParrafo.textContent = "Total a Pagar: ";

  // Subtotal Span
  const totalSpan = document.createElement("SPAN");
  totalSpan.classList.add("fw-normal");
  totalSpan.textContent = `${total}€`;

  // Inyectamos el span al parrafo
  totalParrafo.appendChild(totalSpan);


  // Comrpobamos si hay un div previo con la clase '.total-pagar'
  const totalAPagarDiv = document.querySelector('.total-pagar')
  // Si existe uno, lo eliminamos antes de volver a inyectar el nuevo contenido
  if (totalAPagarDiv) {
    totalAPagarDiv.remove()
  }

  // Añadimos cada parrafo al div general de los totales
  divTotales.appendChild(subtotalParrafo);
  divTotales.appendChild(propinaParrafo);
  divTotales.appendChild(totalParrafo);

  // Seleccionamos el primer div dentro del formulario
  const formulario = document.querySelector(".formulario > div");

  // Inyectamos el div de los totales al formulario para que se muestre
  formulario.appendChild(divTotales);
}
