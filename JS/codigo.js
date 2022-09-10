const cards = document.getElementById("cards");
const items = document.getElementById("items");
const footer = document.getElementById("footer");
const templateCard = document.getElementById("template-card").content;
const templateFooter = document.getElementById("template-footer").content;
const templateCarrito = document.getElementById("template-carrito").content;
const fragment = document.createDocumentFragment();
let carrito = {};

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  if (localStorage.getItem("carrito")) {
    carrito = JSON.parse(localStorage.getItem("carrito"));
    renderCarrito();
  }
});

cards.addEventListener("click", e => {
  addCarrito(e);
});

items.addEventListener("click", e => {
  btnSuma(e);
});
// IMPORTO LOS PRODUCTOS DESDE EL ARCHIVO .json */
const fetchData = async () => {
  try {
    const res = await fetch(".././json/api.json");
    const data = await res.json();
    pintarCards(data);
  } catch (error) {
    console.log(error);
  }
};

const pintarCards = (data) => {
  console.log(data)
  data.forEach((producto) => {
    templateCard.querySelector("h5").textContent = producto.title;
    templateCard.querySelector("p").textContent = producto.precio;
    templateCard.querySelector("img").setAttribute("src", producto.img);
    templateCard.querySelector(".btn").dataset.id = producto.id;

    const clone = templateCard.cloneNode(true);
    fragment.appendChild(clone);
  });
  cards.appendChild(fragment);
};

const addCarrito = (e) => {
  console.log(e.target)
  Toastify({
    text: "Añadido al carrito",
    duration: 1000,
    gravity: "top",
    offset: {
      x: 5,
      y: 70,
    },
    avatar: ".././images/add-to-cart--icon.png",
    position: "right",
    style: {
      background: "#48e",
      color: "black",
    },
  }).showToast();

  if (e.target.classList.contains(".btn")) {
    setCarrito(e.target.parentElement); //EMPUJO TODOS LOS ELEMENTOS AL CARRITO.
  }
  e.stopPropagation();
};

const setCarrito = (obj) => {
  const producto = {
    id: obj.querySelector(".btn").dataset.id,
    title: obj.querySelector("h5").textContent,
    precio: obj.querySelector("p").textContent,
    cantidad: 1
  };

  if (carrito.hasOwnProperty(producto.id)) {
    producto.cantidad = carrito[producto.id].cantidad + 1;
  }

  carrito[producto.id] = { ...producto };
  renderCarrito();
  //console.log(carrito);
};

const renderCarrito = () => {
  console.log(carrito)
  items.innerHTML = "";
  Object.values(carrito).forEach((producto) => {
    templateCarrito.querySelector("th").textContent = producto.id;
    templateCarrito.querySelectorAll("td")[0].textContent = producto.title;
    templateCarrito.querySelectorAll("td")[1].textContent = producto.cantidad;
    templateCarrito.querySelector(".btn-info").dataset.id = producto.id;
    templateCarrito.querySelector(".btn-danger").dataset.id = producto.id;
    templateCarrito.querySelector("span").textContent = producto.cantidad * producto.precio;
     

    const clone = templateCarrito.cloneNode(true);
    fragment.appendChild(clone);
  });
  items.appendChild(fragment);

  pintarFooter();

  localStorage.setItem("carrito", JSON.stringify(carrito));
};

const pintarFooter = () => {
  footer.innerHTML = "";
  if (Object.keys(carrito).length === 0) {
    footer.innerHTML = `
            <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `;
    return;
  }

  const nCantidad = Object.values(carrito).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );
  const nPrecio = Object.values(carrito).reduce(
    (acc, { cantidad, precio }) => acc + cantidad * precio,
    0
  );

  templateFooter.querySelectorAll("td")[0].textContent = nCantidad;
  templateFooter.querySelector("span").textContent = nPrecio;

  const clone = templateFooter.cloneNode(true);
  fragment.appendChild(clone);
  footer.appendChild(fragment);

  const btnVaciar = document.getElementById("vaciar-carrito");
  btnVaciar.addEventListener("click", () => {
    carrito.length == 0
      ? Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Parece que el carrito está vacío, ¡Agregá productos!",
        })
      : Swal.fire({
          icon: "question",
          title: "¿Estás seguro de vaciar el carrito?",
          showDenyButton: true,
          confirmButtonText: "Vaciar",
          denyButtonText: `Cancelar`,
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire("¡Carrito vaciado!", "", "success");
            // Limpiamos los productos guardados
            carrito = {};
            // Renderizamos los cambios
            renderCarrito();
            // Borra LocalStorage
            localStorage.removeItem("carrito");
          }
        });
  });

  const botonComprar = document.querySelector(".boton-comprar");
  botonComprar.addEventListener("click", compraTodo);
  // SE AGREGA API AL BOTÓN DE COMPRAR..
  function compraTodo() {
    carrito.length == 0
      ? Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Parece que el carrito está vacío, ¡Agregá productos!",
        })
      : fetch("https://ricardofort.herokuapp.com/all")
          .then((resp) => resp.json())
          .then((data) => {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Compra realizada con éxito",
              text: `¡Gracias por tu compra! : ¡${data.frases[4]}!`,
              showConfirmButton: false,
              timer: 2000,
            });
            carrito.length = 0;
            carrito = {};
            renderCarrito();
            localStorage.removeItem("carrito");
          });
  }
};

const btnSuma = (e) => {
  //console.log(e.target)
  // ACCIÓN DE AUMENTAR
  if (e.target.classList.contains("btn-info")) {
    carrito[e.target.dataset.id];
    const producto = carrito[e.target.dataset.id];
    producto.cantidad++;
    carrito[e.target.dataset.id] = { ...producto };
    renderCarrito();
  }

  if (e.target.classList.contains("btn-danger")) {
    const producto = carrito[e.target.dataset.id];
    producto.cantidad--;

    if (producto.cantidad === 0) {
      delete carrito[e.target.dataset.id]; // CUANDO DISMINUIMOS LOS PRODUCTOS Y LLEGA A 0, SE ELIMINA EL PRODUCTO.
    }
    renderCarrito();
  }

  e.stopPropagation();
};

window.onload = function () {
  const storage = JSON.parse(localStorage.getItem("carrito"));
  //console.log(storage);
  //console.log(JSON.stringify(storage));
  if (storage) {
    Toastify({
      text: "¡Tenés productos en el carrito!",
      className: "info",
      gravity: "top",
      position: "right",
    }).showToast();
    carrito = storage;
    renderCarrito();
  }
};

