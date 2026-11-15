// ===== Recipe Explorer =====

// ---- 1. Grab the pieces of the page, using the ids in index.html ----
const categorySelect = document.getElementById('category');
const categoryTitle = document.getElementById('categoryTitle');
const alertBox = document.getElementById('alert');
const recipeContainer = document.getElementById('recipeContainer');
const loadMoreButton = document.getElementById('loadMore');
const modal = document.getElementById('recipeModal');
const modalTitle = document.getElementById('recipeTitle');
const modalContent = document.getElementById('modalContent');
const closeButton = document.getElementById('close');

// ---- 2. Memory ----
let allMeals = []; 
let shown = 6;     
const pageSize = 6; 

// Protects the page: turns characters like < and > into harmless text,
// in case a data source ever sends HTML instead of a name.
function clean(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---- 3. Load a category (ASYNC) ----
async function loadCategory(category) {
  alertBox.textContent = 'Loading recipes...';
  recipeContainer.innerHTML = '';
  loadMoreButton.classList.add('hidden');
  categoryTitle.textContent = category + ' Recipes';

  try {
    const url = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=' + category;
    const response = await fetch(url);

    if (response.ok === false) {
      alertBox.textContent = 'Could not load recipes. Try again.';
      return;
    }

    const data = await response.json();
    allMeals = data.meals;
    shown = pageSize;
    alertBox.textContent = '';
    showMeals();
  } catch (error) {
    alertBox.textContent = 'Check your internet and try again.';
  }
}

// ---- 4. Draw the cards (SYNC) ----
function showMeals() {
  recipeContainer.innerHTML = '';

  let i = 0;
  while (i < shown && i < allMeals.length) {
    const meal = allMeals[i];

    recipeContainer.innerHTML += `
      <button data-id="${meal.idMeal}"
        class="bg-white rounded-2xl shadow overflow-hidden text-left cursor-pointer hover:shadow-xl hover:-translate-y-1 transition focus-visible:outline-2 focus-visible:outline-[#023047]">
        <img src="${meal.strMealThumb}" alt="${clean(meal.strMeal)}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="font-bold">${clean(meal.strMeal)}</h3>
          <p class="text-sm text-[#fb8500] mt-2">View recipe</p>
        </div>
      </button>`;

    i = i + 1;
  }

  if (shown >= allMeals.length) {
    loadMoreButton.classList.add('hidden');
  } else {
    loadMoreButton.classList.remove('hidden');
  }
}

// ---- 5. Load More ----
function loadMore() {
  shown = shown + pageSize;
  showMeals();
}

// ---- 6. Open a recipe in the pop-up (ASYNC: needs one more fetch) ----
async function openRecipe(id) {
  modalTitle.textContent = 'Loading...';
  modalContent.innerHTML = '';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden'; // stop the page behind from scrolling

  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    if (response.ok === false) {
      modalTitle.textContent = 'Could not load this recipe.';
      return;
    }
    const data = await response.json();
    showRecipe(data.meals[0]);
  } catch (error) {
    modalTitle.textContent = 'Check your internet and try again.';
  }
  
function showRecipe(meal) {
  modalTitle.textContent = meal.strMeal;
  
  let ingredients = '';
  let n = 1;
  while (n <= 20) {
    const item = meal['strIngredient' + n];
    const amount = meal['strMeasure' + n];
    if (item && item.trim() !== '') {
      ingredients += '<li>' + clean(amount) + ' ' + clean(item) + '</li>';
    }
    n = n + 1;
  }

  let steps = '';
  const lines = meal.strInstructions.split('\n');
  lines.forEach(function (line) {
    if (line.trim() !== '') {
      steps += '<p>' + clean(line) + '</p>';
    }
  });

  let video = '';
  if (meal.strYoutube) {
    video = `<a href="${clean(meal.strYoutube)}" target="_blank" rel="noopener"
      class="inline-block text-[#fb8500] font-semibold hover:underline">Watch on YouTube</a>`;
  }

  modalContent.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${clean(meal.strMeal)}" class="w-full max-h-72 object-cover rounded-xl">
    <p class="text-sm text-slate-600">${clean(meal.strCategory)} &bull; ${clean(meal.strArea)}</p>
    <h3 class="font-bold text-lg">Ingredients</h3>
    <ul class="list-disc pl-6 space-y-1">${ingredients}</ul>
    <h3 class="font-bold text-lg">Instructions</h3>
    <div class="space-y-3 text-slate-700">${steps}</div>
    ${video}`;
}

// ---- 7. Close the pop-up ----
function closeRecipe() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

// ---- 8. Connect everything to clicks and keys ----
categorySelect.addEventListener('change', function () {
  loadCategory(categorySelect.value);
});

loadMoreButton.addEventListener('click', loadMore);
  
recipeContainer.addEventListener('click', function (event) {
  const card = event.target.closest('[data-id]');
  if (card) {
    openRecipe(card.dataset.id);
  }
});

closeButton.addEventListener('click', closeRecipe);

modal.addEventListener('click', function (event) {
  if (event.target === modal) {
    closeRecipe();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeRecipe();
  }
});

// ---- 9. Start: load the first category ----
loadCategory(categorySelect.value);
