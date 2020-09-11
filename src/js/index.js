// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/*
 - Search Object
 - Current recipe object
 - Shopping list object
 - Liked recipes
 */
const state = {};
//window.state = state;

/****************
SEARCH CONTROLLER
*****************/
const controlSearch = async () => {
  const query = searchView.getInputs();
  
  
  //console.log(query);
  if (query) {
      state.search = new Search(query);
      searchView.clearInput();
      searchView.clearResults();
      renderLoader(elements.searchRes);

      try{
         await state.search.getResults();
         //console.log(state.search.result);
         clearLoader();
         searchView.renderResults(state.search.result);
     } catch (err) {
          alert('Somthing went wrong with the search...');
          clearLoader();
     }
  }
}

elements.searchForm.addEventListener('submit', e => {
   e.preventDefault();
   controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
   const btn = e.target.closest('.btn-inline');
   if (btn) {
      const goToPage = parseInt(btn.dataset.goto, 10);
      searchView.clearResults();
      searchView.renderResults(state.search.result, goToPage);
   }
});

/****************
RECIPE CONTROLLER
*****************/
/*
const r = new Recipe(47746);
r.getRecipe();
console.log(r);
*/
const controlRecipe = async () => {
   // Get the id from the URL
   const id = window.location.hash.replace('#', '');
   //console.log(id);

   if (id) {
      // Prepare UI for changes
      recipeView.clearRecipe();
      renderLoader(elements.recipe);

      // Highlight selected search item
      if (state.search) searchView.highlitedSelected(id);

     // Create new recipe object
     state.recipe = new Recipe(id);
     
     try{
         // Get recipe data and parse ingredients
          await state.recipe.getRecipe();
          state.recipe.parseIngredients();

         // Calculate servings and time
         state.recipe.calcTime();
         state.recipe.calcServings();

         // Render recipe 
         //console.log(state.recipe);
         clearLoader();
         recipeView.renderRecipe(
            state.recipe, 
            state.likes.isLiked(id)
            );

     }  catch (err) {
           console.log(err);
           alert('Error Processing recipe!');
     }
     
   }
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/****************
LIST CONTROLLER
*****************/
const controlList = () => {
   // List is empty
   if (!state.list) state.list = new List();

   // Add ingredients to the list and UI
   state.recipe.ingredients.forEach(el => {
       const item = state.list.addItem(el.count, el.unit, el.ingredient);
       listView.renderItem(item);
   }); 
}

// Delete and Update list item
elements.shopping.addEventListener('click', e => {
     const id = e.target.closest('.shopping__item').dataset.itemid;

     if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        listView.deleteItem(id);
     } else if (e.target.matches('.shopping__count-value')) {
           const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val);
     }
});

/****************
LIKE CONTROLLER
*****************/
const controlLike = () => {
     // like is empty
     if(!state.likes) state.likes = new Likes();

     const currentID = state.recipe.id;

     // User has Not yet liked the recipe
     if(!state.likes.isLiked(currentID)) {
        const newLike = state.likes.addLike(
           currentID,
           state.recipe.title,
           state.recipe.author,
           state.recipe.img
        );

        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike);
        //console.log(state.likes);

     // User Has liked the recipe
     } else {
        state.likes.deleteLike(currentID);
        likesView.toggleLikeBtn(false);
        //console.log(state.likes);
        likesView.deleteLike(currentID);
     }
     likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// Restoring liked recipes on page load
window.addEventListener('load', () => {
   state.likes = new Likes();
   state.likes.readStorage();
   likesView.toggleLikeMenu(state.likes.getNumLikes());
   // Render the existing likes
   state.likes.likes.forEach(like => likesView.renderLike(like));
});



// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
     if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        } 
     } else if (e.target.matches('.btn-increase, .btn-increase *')){
           state.recipe.updateServings('inc');
           recipeView.updateServingsIngredients(state.recipe);

     } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *' )) {
          // Add ingredients to shopping list
          controlList();
     } else if (e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
     }
});


//window.l = new List();

