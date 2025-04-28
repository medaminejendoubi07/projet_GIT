const shopIcon = document.querySelector(".shop__icon");
const shopCount = document.querySelector(".shop__count");
const shopCashier = document.querySelector(".shop__cashier");
const addedProduct = document.querySelector(".added__products");
const removeAll = document.querySelector(".removeAll");
const totalPrice = document.querySelector(".total");

const search = document.querySelector(".search__bar");

const productCart = document.querySelector(".products");
const cartDetail = document.querySelector("[data-cartDetail]");
const singleProducts = document.querySelector("[data-singleProduct]");
const shadow = document.querySelector(".shadow");
const close = document.querySelector(".close");

class Storage {
  static addStorage(product) {
    localStorage.setItem("product", JSON.stringify(product));
  }

  static getStorage() {
    return JSON.parse(localStorage.getItem("product")) || [];
  }
}

let cart = Storage.getStorage();

class FetchData {
  async getProducts() {
    try {
      const res = await fetch("data.json");
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Erreur lors du chargement des produits :", error);
    }
  }
}

class UI {
  allCarts(products) {
    let cartHTML = products.map(product => `
      <div class="product">
        <div class="image">
          <img src="${product.img_url}" alt="product">
          <div class="buttons">
            <span class="addProduct" data-id="${product.id}">
              <i class="fa-solid fa-cart-plus"></i>
            </span>
            <span class="seeProduct" data-id="${product.id}">
              <i class="fa-solid fa-eye"></i>
            </span>
          </div>
        </div>
        <div class="product__body">
          <h1>${product.title}</h1>
          <div class="stars">
            ${'<i class="fa-solid fa-star"></i>'.repeat(product.review)}
          </div>
          <span class="price">${product.price} TND</span>
          <p class="disc">${product.description.substring(0, 44)}...</p>
        </div>
      </div>
    `).join(""); // Affiche les produits

    productCart.innerHTML = products.length ? cartHTML : "Chargement...";
  }

  findButtons(products) {
    const addCartButtons = [...document.querySelectorAll(".addProduct")];

    productCart.addEventListener("click", (e) => {
      const btnId = e.target.closest("span")?.dataset.id; // Récupère l'ID du produit sélectionné 

      if (e.target.closest(".seeProduct")) {
        cartDetail.classList.add("active");
        shadow.classList.add("active");
        this.singleCart(products, btnId); //3i
      }

      if (e.target.closest(".addProduct")) {
        window.scroll({ top: 0, behavior: "smooth" });
        shopCashier.classList.add("active");
        this.addProduct(products, btnId);
        this.updates();
        this.disableBtn(addCartButtons); //ajo pro pani+
      }
    });
//*
    close.addEventListener("click", () => {
      cartDetail.classList.remove("active");
      shadow.classList.remove("active");
    });
// afi pa n afi p
    shopIcon.addEventListener("click", () => {
      shopCashier.classList.toggle("active");
      shadow.classList.toggle("active");
    });

    addedProduct.addEventListener("click", (e) => {
      const btnId = e.target.closest("button")?.dataset.id;

      if (e.target.closest(".delete")) {
        this.deleteProduct(btnId); //sup
      }

      if (e.target.closest(".increment")) {
        this.increment(btnId); // +1 2 3 .. 
      }

      if (e.target.closest(".decrement")) {
        this.decrease(btnId); //- 1 2 -3 
      }
    });

    removeAll.addEventListener("click", () => {
      cart = []; //p 0 
      Storage.addStorage(cart);
      this.updates();
    });

    this.disableBtn(addCartButtons);
  }

  updates() {
    this.displayShop(); // aff p d pan
    this.shopNumber(); //compteur p 
    this.priceSum(); // tt px
    removeAll.style.display = cart.length ? "block" : "none";
  }
// ein
  singleCart(products, btnId) {
    const product = products.find(item => item.id === +btnId);
    if (product) {
      singleProducts.innerHTML = `
        <img src="${product.img_url}" alt="product">
        <div class="details">
          <h1>${product.title}</h1>
          <p>Description :</p>
          <p>${product.description}</p>
          <div class="stars">
            ${'<i class="fa-solid fa-star"></i>'.repeat(product.review)}
          </div>
          <p>${product.price} TND</p>
        </div>
      `;
    }
  }

  addProduct(products, btnId) { //  // Ajout p au pani
    const product = products.find(item => item.id === +btnId);
    if (product && !cart.some(item => item.id === product.id)) {
      cart.push({ ...product, qty: 1 });
      Storage.addStorage(cart);
      this.updates();
    }
  }
// Affiche les produits dans la fenêtre du panier
  displayShop() {
    addedProduct.innerHTML = cart.map(product => `
      <div class="product">
        <img src="${product.img_url}" alt="">
        <div class="texts">
          <h1>${product.title}</h1>
          <p>${product.description.substring(0, 25)}...</p>
          <span class="price">${product.price} TND</span>
          <div class="remove">
            <div class="btns">
              <button data-id="${product.id}" class="increment"><i class="fa-solid fa-plus"></i></button>
              <span>${product.qty}</span>
              <button data-id="${product.id}" class="decrement"><i class="fa-solid fa-minus"></i></button>
            </div>
            <button data-id="${product.id}" class="delete">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  shopNumber() {
    shopCount.innerHTML = cart.length;
  }

  disableBtn(addCartButtons) {
    addCartButtons.forEach(btn => {
      const isDisabled = cart.some(item => item.id === +btn.dataset.id);
      btn.classList.toggle("disable", isDisabled);
    });
  }
// sup p 
  deleteProduct(btnId) {
    cart = cart.filter(item => item.id !== +btnId);
    Storage.addStorage(cart);
    this.updates();
  }
// + p p 
  increment(btnId) {
    cart = cart.map(item => {
      if (item.id === +btnId) item.qty++;
      return item;
    });
    Storage.addStorage(cart);
    this.updates();
  }
// - p p
  decrease(btnId) {
    cart = cart.map(item => {
      if (item.id === +btnId) {
        item.qty--;
        if (item.qty <= 0) return null;
      }
      return item;
    }).filter(Boolean);
    Storage.addStorage(cart);
    this.updates();
  }

  priceSum() {
    const totalPrices = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    totalPrice.innerText = `${totalPrices.toFixed(2)} TND`;
  }

  searchProduct(products) {
    search.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(value)
      );
      this.allCarts(filteredProducts);
      this.updates();
    });
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const products = new FetchData();
  const ui = new UI();

  ui.updates();
  const productList = await products.getProducts();
  ui.allCarts(productList);
  ui.findButtons(productList);
  ui.searchProduct(productList);
});
const loginForm = document.querySelector(".login .form");
const registerForm = document.querySelector(".register .form");

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginForm.querySelector('input[type="email"]').value.trim();
  const password = loginForm.querySelector('input[type="password"]').value.trim();

  if (!email || !password) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Veuillez entrer une adresse email valide !");
    return;
  }

  alert("Connexion réussie !");
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = registerForm.querySelector('input[type="text"]').value.trim();
  const email = registerForm.querySelector('input[type="email"]').value.trim();
  const password = registerForm.querySelector('input[type="password"]').value.trim();
  const confirmPassword = registerForm.querySelectorAll('input[type="password"]')[1].value.trim();

  if (!username || !email || !password || !confirmPassword) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Veuillez entrer une adresse email valide !");
    return;
  }

  if (password !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas !");
    return;
  }

  alert("Inscription réussie !");
});
