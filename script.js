const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('.service-card');
const form = document.querySelector('.lead-form');
const calcPrice = document.querySelector('#calcPrice');
const modal = document.querySelector('.modal');
const modalImg = modal.querySelector('img');
const modalClose = document.querySelector('.modal-close');
const toast = document.querySelector('.toast');
const showMoreBtn = document.querySelector('#show-more-btn');
const catalogActions = document.querySelector('.catalog-actions');
const ITEMS_PER_PAGE = 8;
let isExpanded = false;

function applyFilter(filter) {
  let visibleCount = 0;
  isExpanded = false;
  if (showMoreBtn) showMoreBtn.textContent = 'Показать еще';
  
  cards.forEach((card) => {
    const categories = (card.dataset.categories || card.dataset.category || '').split(/\s+/);
    const matches = filter === 'all' || categories.includes(filter);
    
    if (matches) {
      if (filter === 'all' && visibleCount >= ITEMS_PER_PAGE) {
        card.classList.add('hidden');
        card.classList.add('paginated-hidden');
      } else {
        card.classList.remove('hidden');
        card.classList.remove('paginated-hidden');
      }
      visibleCount++;
    } else {
      card.classList.add('hidden');
      card.classList.remove('paginated-hidden');
    }
  });

  if (catalogActions) {
    if (filter === 'all' && visibleCount > ITEMS_PER_PAGE) {
      catalogActions.style.display = 'flex';
    } else {
      catalogActions.style.display = 'none';
    }
  }
}

showMoreBtn?.addEventListener('click', () => {
  const hiddenCards = document.querySelectorAll('.service-card.paginated-hidden');
  
  if (!isExpanded) {
    hiddenCards.forEach(card => card.classList.remove('hidden'));
    isExpanded = true;
    showMoreBtn.textContent = 'Свернуть';
  } else {
    isExpanded = false;
    showMoreBtn.textContent = 'Показать еще';
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
      // Delay hiding to allow smooth scroll to start and not jar the user
      setTimeout(() => {
        hiddenCards.forEach(card => card.classList.add('hidden'));
      }, 300);
    } else {
      hiddenCards.forEach(card => card.classList.add('hidden'));
    }
  }
});

// Run initially
applyFilter('all');

burger?.addEventListener('click', () => {
  const isOpen = header.classList.toggle('menu-open');
  burger.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => header.classList.remove('menu-open'));
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const filter = tab.dataset.filter;
    applyFilter(filter);
  });
});

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value / 500) * 500) + ' ₽';
}

function updateCalculator() {
  if (!form) return;
  const service = Number(form.elements.service.value || 0);
  const carClass = Number(form.elements.class.value || 1);
  calcPrice.textContent = 'от ' + formatPrice(service * carClass);
}

form?.addEventListener('change', updateCalculator);
updateCalculator();

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const payload = {
    service: form.elements.service.options[form.elements.service.selectedIndex].text,
    carClass: form.elements.class.options[form.elements.class.selectedIndex].text,
    phone: form.elements.phone.value,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('detailing-demo-lead', JSON.stringify(payload));
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
  form.reset();
  updateCalculator();
});

document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    modalImg.src = item.dataset.img;
    modalImg.alt = item.querySelector('img').alt || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  });
});

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

// --- Hero Section Perfect Symmetry ---
function syncHeroSymmetry() {
  const textTop = document.querySelector('.hero-text-group');
  const img = document.querySelector('.hero-media > img');
  const card = document.querySelector('.hero-card');
  const heroCopy = document.querySelector('.hero-copy');
  const heroMedia = document.querySelector('.hero-media');
  
  if (window.innerWidth > 1180 && textTop && img && card && heroCopy && heroMedia) {
    const textHeight = textTop.getBoundingClientRect().height;
    
    // 1. Reset wrapper alignments
    heroCopy.style.alignSelf = 'start';
    heroMedia.style.marginTop = '0px';
    
    // 2. Align start points (media has 14px padding)
    heroCopy.style.paddingTop = '14px';
    
    // 3. Find EXACT Y coordinate of the visual bottom of the text
    const actions = document.querySelector('.hero-actions');
    const lastTextElement = textTop.lastElementChild;
    const heroTop = heroCopy.getBoundingClientRect().top;
    const textBottomRelative = lastTextElement.getBoundingClientRect().bottom - heroTop;
    
    // 4. Image height matches text block EXACTLY
    img.style.flex = '0 0 auto';
    img.style.aspectRatio = 'auto';
    img.style.height = Math.max(0, textBottomRelative - 14) + 'px';
    
    // 5. Align Card top with Actions top EXACTLY
    const actionsTopRelative = actions.getBoundingClientRect().top - heroTop;
    heroMedia.style.gap = '0px';
    card.style.marginTop = Math.max(0, actionsTopRelative - textBottomRelative) + 'px';
  } else if (heroMedia && img && card && heroCopy) {
    // Reset for mobile
    heroCopy.style.alignSelf = '';
    heroCopy.style.paddingTop = '';
    heroMedia.style.marginTop = '';
    heroMedia.style.gap = '';
    img.style.flex = '';
    img.style.aspectRatio = '';
    img.style.height = '';
    card.style.marginTop = '';
  }
}

// Execute on resize and DOM load
window.addEventListener('resize', syncHeroSymmetry);
document.addEventListener('DOMContentLoaded', syncHeroSymmetry);
syncHeroSymmetry();

// Observe text layout changes (e.g. after Google Fonts load)
const heroCopyObserver = document.querySelector('.hero-copy');
if (heroCopyObserver) {
  new ResizeObserver(syncHeroSymmetry).observe(heroCopyObserver);
}
