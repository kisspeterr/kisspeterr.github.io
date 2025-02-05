document.addEventListener('DOMContentLoaded', function () {
  // Betöltjük a tartalmakat (footer, info, modal) minden oldalon
  loadInfoSection();
  loadModal();
  loadFooter();

  // Csak akkor töltjük be a termékeket, ha a szükséges elemek léteznek
  const featuredContainer = document.getElementById('featured-products');
  const allProductsContainer = document.getElementById('all-products');
  if (featuredContainer || allProductsContainer) {
      loadProducts();
  }
});

// Termékek betöltésének külön függvénye
function loadProducts() {
  const typeFilter = document.getElementById('type-filter');
  const featuredContainer = document.getElementById('featured-products');
  const allProductsContainer = document.getElementById('all-products');

  fetch('./products.json')
      .then(response => {
          if (!response.ok) {
              throw new Error(`Hálózati hiba: ${response.status}`);
          }
          return response.json();
      })
      .then(products => {
          if (featuredContainer) renderFeaturedProducts(products);
          if (allProductsContainer) renderProducts(products);

          // Szűrő eseményfigyelő
          if (typeFilter) {
              typeFilter.addEventListener('change', function () {
                  const selectedType = this.value;
                  const filteredProducts = selectedType === 'all' 
                      ? products 
                      : products.filter(product => product.type === selectedType);
                  if (allProductsContainer) renderProducts(filteredProducts);
              });
          }
      })
      .catch(error => console.error('Hiba a termékek betöltésekor:', error));
}

// Kiemelt termékek megjelenítése
function renderFeaturedProducts(products) {
  const featuredContainer = document.getElementById('featured-products');
  featuredContainer.innerHTML = '';
  products.filter(product => product.featured).forEach(product => {
      const card = `
          <div class="col-md-4 product-card">
              <div class="card" onclick="viewProduct(${product.id})">
                  <div class="card-body">
                      <h5 class="card-title">${product.name}</h5>
                      <img src="${product.image}" class="card-img-top" alt="${product.name}">
                      <p class="card-text">${product.description.substring(0, 100)}...</p>
                      <button class="btn btn-primary">Olvass tovább</button>
                  </div>
              </div>
          </div>`;
      featuredContainer.innerHTML += card;
  });
}

// Teljes terméklista megjelenítése
function renderProducts(products) {
  const allProductsContainer = document.getElementById('all-products');
  allProductsContainer.innerHTML = '';
  products.forEach(product => {
      if (!product.visible) return;
      const card = `
          <div class="col-md-4 product-card">
              <div class="card" onclick="viewProduct(${product.id})">
                  <div class="card-body">
                      <h5 class="card-title">${product.name}</h5>
                      <img src="${product.image}" class="card-img-top" alt="${product.name}">
                      <p class="card-text">${product.description.substring(0, 100)}...</p>
                      <button class="btn btn-primary">Olvass tovább</button>
                  </div>
              </div>
          </div>`;
      allProductsContainer.innerHTML += card;
  });
}

function viewProduct(productId) {
  fetch('products.json')
    .then(response => response.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (product) {
        document.getElementById('modal-title').innerText = product.name;
        document.getElementById('modal-image').src = product.image;
        document.getElementById('modal-description').innerText = product.description;

        // Ízek betöltése
        const flavorsList = document.getElementById('modal-flavors');
        flavorsList.innerHTML = product.flavors
          ? product.flavors.map(flavor => `<li>${flavor}</li>`).join('')
          : '<li>Nincs információ</li>';

        // Desszert ízek betöltése (csak Power Whey esetén)
        const dessertFlavorsList = document.getElementById('modal-dessert-flavors');
        if (product.name === "Power Whey" && product.dessert_flavors) {
          dessertFlavorsList.innerHTML = product.dessert_flavors.map(flavor => `<li>${flavor}</li>`).join('');
          document.getElementById('dessert-flavors-section').style.display = 'block'; // Megjelenítjük a szekciót
        } else {
          document.getElementById('dessert-flavors-section').style.display = 'none'; // Elrejtjük a szekciót
        }

        // Kiszerelés betöltése
        const packagingList = document.getElementById('modal-packaging');
        packagingList.innerHTML = product.packaging
          ? product.packaging.map(size => `<li>${size}</li>`).join('')
          : '<li>Nincs információ</li>';

        // Adagolás betöltése
        const dosageElement = document.getElementById('modal-dosage');
        dosageElement.innerText = product.dosage || 'Nincs információ';

        // Modal megjelenítése
        new bootstrap.Modal(document.getElementById('productModal')).show();
      } else {
        console.error('Nem található a termék az adott azonosítóval:', productId);
      }
    })
    .catch(error => console.error('Hiba a termék részleteinek betöltésekor:', error));
}
  

const scrollArrow = document.getElementById('scroll-arrow');
if (scrollArrow) {
    let isAtBottom = false;

    scrollArrow.addEventListener('click', () => {
        if (isAtBottom) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const sections = document.querySelectorAll('section');
        const currentScroll = window.scrollY + 1;

        let foundNextSection = false;
        for (let i = 0; i < sections.length; i++) {
            const sectionTop = sections[i].offsetTop;
            if (sectionTop > currentScroll) {
                sections[i].scrollIntoView({ behavior: 'smooth' });
                foundNextSection = true;
                break;
            }
        }

        if (!foundNextSection) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
            scrollArrow.textContent = '↑';
            isAtBottom = true;
        } else {
            scrollArrow.textContent = '↓';
            isAtBottom = false;
        }
    });
}





// Info section betöltése
async function loadInfoSection() {
  try {
    const response = await fetch('info.html');
    if (!response.ok) throw new Error('Hálózati hiba: ' + response.status);
    const data = await response.text();
    document.body.insertAdjacentHTML('beforeend', data);
    console.log('Info section betöltve!');
  } catch (error) {
    console.error('Hiba az info section betöltésekor:', error);
  }
}

// Footer betöltése
async function loadFooter() {
  try {
    const response = await fetch('footer.html');
    if (!response.ok) throw new Error('Hálózati hiba: ' + response.status);
    const data = await response.text();
    document.body.insertAdjacentHTML('beforeend', data);
    console.log('Footer betöltve!');
  } catch (error) {
    console.error('Hiba a footer betöltésekor:', error);
  }
}

// Modal betöltése
async function loadModal() {
  try {
    const response = await fetch('modal.html');
    if (!response.ok) throw new Error('Hálózati hiba: ' + response.status);
    const data = await response.text();
    document.body.insertAdjacentHTML('beforeend', data);
    console.log('Modal betöltve!');
  } catch (error) {
    console.error('Hiba a modal betöltésekor:', error);
  }
}
