let d = document;
let url = "./data.json";
let $main = d.querySelector(".main");
let $template = document.querySelector(".template").content;
let $fragment = document.createDocumentFragment();
let $cartTotalPrice = d.querySelector(".cart-total-price");
const $backgroundEmpty = d.querySelector(".background-empty");
let $cartContainer = d.querySelector(".cart-container");
const $btnConfirm = d.querySelector(".cart-button-confirm");
const $containerProductsCard = d.querySelector(".container-product-card");
const $cartModal = d.querySelector(".modal-cart");
const $buyProducts = d.querySelector(".buy-products");
const $newOrderBtn = d.querySelector(".new-order")

let cart = {};
d.addEventListener("DOMContentLoaded", (e) => {
  getData();
  $backgroundEmpty.style.display = "block";
  $cartModal.style.display = "none";
});

$btnConfirm.addEventListener("click", (e) => {
  let result = confirm("YOU WANT TO MAKE THE PURCHASE");

  if (result) {
    showModalProducts()
  }
});

$newOrderBtn.addEventListener("click", e=>{
  location.reload()
})

async function getData() {
  let res = await fetch(url);
  let data = await res.json();

  drawCards(data);

  $main.addEventListener("click", (e) => {
    catchEvent(e);
  });

  let $minus = d.querySelectorAll(".minus");
  let $plus = d.querySelectorAll(".plus");

  $plus.forEach((plus) => {
    plus.addEventListener("click", (e) => {
      //console.log(e.target.getAttribute("data-id"))
      //console.log(e.target.previousElementSibling.value)
      //console.log(cart[0].quantity++);

      cart[e.target.getAttribute("data-id")].quantity++;
      e.target.previousElementSibling.value =
        cart[e.target.getAttribute("data-id")].quantity;
      drawCart();
    });
  });
  $minus.forEach((minus) => {
    minus.addEventListener("click", (e) => {
      console.log(e.target.nextElementSibling.value);
      console.log(e.target.parentElement);

      cart[e.target.getAttribute("data-id")].quantity--;
      e.target.nextElementSibling.value =
        cart[e.target.getAttribute("data-id")].quantity;

      if (cart[e.target.getAttribute("data-id")].quantity === 0) {
        e.target.parentElement.style.display = "none";
        delete cart[e.target.getAttribute("data-id")];

        if (Object.values(cart).length === 0) {
          $backgroundEmpty.style.display = "block";
        }
      }
      drawCart();
    });
  });
}

function drawCards(data) {
  data.forEach((el, i) => {
    $template.querySelector("img").src = `${el.image.desktop}`;
    $template.querySelector("img").alt = `${el.name}`;
    $template.querySelector(".product").textContent = `${el.category}`;
    $template.querySelector(".category").textContent = `${el.name}`;
    $template.querySelector(".price").textContent = `${el.price.toFixed(2)}`;
    $template.querySelector(".button").dataset.id = i;
    $template.querySelector(".button").setAttribute("data-image-thumbnail", el.image.thumbnail);;
    $template.querySelector(".button2").setAttribute("data-price", el.price);
    $template.querySelector(".button2").setAttribute("data-name", el.name);
    $template.querySelector(".button2").setAttribute("data-id", i);
    $template.querySelector(".button2").setAttribute("id", i);
    $template.querySelector(".minus").setAttribute("data-id", i);
    $template.querySelector(".plus").setAttribute("data-id", i);

    let $clone = d.importNode($template, true);
    $fragment.appendChild($clone);
  });

  $main.appendChild($fragment);
}

function catchEvent(event) {
  if (event.target.classList.contains("button")) {
    setCart(event.target.parentElement);
    event.target.nextElementSibling.style.display = "flex";
    console.log(event.target.nextElementSibling.querySelector("input").value);
    console.log(event.target);
    cart[event.target.getAttribute("data-id")].quantity = 1;
    event.target.nextElementSibling.querySelector("input").value =
      cart[event.target.getAttribute("data-id")].quantity;
    drawCart();

    hideCartEmpty();
  }

  event.stopPropagation();
}

function setCart(object) {
  const product = {
    id: object.querySelector(".button").getAttribute("data-id"),
    name: object.querySelector(".category").textContent,
    price: parseFloat(object.querySelector(".price").textContent).toFixed(2),
    quantity: 1,
    imgThumbnail: object.querySelector(".button").getAttribute("data-image-thumbnail")
  };

  if (cart.hasOwnProperty(product.id)) {
    product.quantity = cart[product.id].quantity + 1;
  }

  cart[product.id] = { ...product };

  drawCart();
}

function drawCart() {
  $containerProductsCard.innerHTML = "";
  $buyProducts.innerHTML = "";
  Object.values(cart).forEach((product) => {
    $containerProductsCard.innerHTML += `
    <div id = "${product.id}" class="cart-products  products-${product.id}">
    <p class="${product.id}">${product.name}</p>
    <div class="cart-description-container">
    <p class="cart-product-quantity">${product.quantity}x</p>
    <p class="cart-product-price"><span class = "at">@</span> $${parseFloat(product.price).toFixed(2)}</p>
    <p class="cart-product-total-price">$${(
      product.price * product.quantity
    ).toFixed(2)}</p>
    <div   class="cart-close-icon-product" data-id="${product.id}"></div>
    </div>
    </div>        
    `;

    $buyProducts.innerHTML += `
    <div class="cart-products-modal">
     <div class = "cart-modal-description-product">
       <img src = ${product.imgThumbnail}>
        <div class="modal-name-prices-description">
           <p class="name-product-modal">${product.name}</p>
           <div class="cart-description-container-modal">
           <p class="cart-product-quantity-modal">${product.quantity}x</p>
           <p class="cart-product-price-modal"><span class = "at">@</span>$${parseFloat(product.price).toFixed(2)}</p>
          </div>
        </div>
          <p class="cart-product-total-price-modal">$${(product.price * product.quantity).toFixed(2)}</p>
     </div>
     </div>        
    `;
  });

  let $remove = d.querySelectorAll(".cart-close-icon-product");

  $remove.forEach((elem) => {
    elem.addEventListener("click", (e) => {
      delete cart[elem.getAttribute("data-id")];

      d.getElementById(elem.getAttribute("data-id")).style.display = "none";
      drawCart();

      hideCartEmpty();
    });
  });

  getTotal(cart);
  getOrderTotal(cart);
}

function getTotal(object) {
  let count = Object.values(object).reduce((acc, el) => acc + el.quantity, 0);

  d.querySelector("h2").innerHTML = `Your Cart (${count})`;

  
}

function getOrderTotal(object) {
  let total = Object.values(object).reduce(
    (acc, el) => acc + el.quantity * el.price,
    0
  );

  $cartTotalPrice.innerHTML = `
        <span>$${total}</span>
  `;

  return total
}

function hideCartEmpty() {
  if (Object.values(cart).length < 1) {
    $backgroundEmpty.style.display = "block";
  } else if (Object.values(cart).length != 0) {
    $backgroundEmpty.style.display = "none";
  }
}

window.addEventListener("resize", (e) => {
  console.log(e.target.innerWidth);
});



function showModalProducts(){
  $cartModal.style.display = "block";
  const $div = d.createElement("div")
  $div.classList.add("order-total-modal")
  const $html1 = `
   <p class = "order-total-modal">Order Total: <div><span>$${Object.values(cart).reduce((acc, el)=> acc + el.quantity * el.price,0)}</span></div>
  ` 
  $div.innerHTML = $html1

  $buyProducts.appendChild($div)
}