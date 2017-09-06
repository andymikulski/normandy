import { fromJS, Map } from 'immutable';
import { combineReducers } from 'redux';

import {
  RECIPE_DELETE,
  RECIPE_LISTING_COLUMNS_CHANGE,
  RECIPE_PAGE_RECEIVE,
  RECIPE_RECEIVE,
  RECIPE_FILTERS_RECEIVE,
  RECIPE_HISTORY_RECEIVE,
} from 'control_new/state/action-types';
import {
  RECIPE_LISTING_COLUMNS,
} from 'control_new/state/constants';


function filters(state = new Map(), action) {
  switch (action.type) {
    case RECIPE_FILTERS_RECEIVE:
      return fromJS(action.filters);

    default:
      return state;
  }
}


function history(state = new Map(), action) {
  switch (action.type) {
    case RECIPE_HISTORY_RECEIVE:
      return state.set(action.recipeId, fromJS(action.revisions.map(revision => revision.id)));

    case RECIPE_DELETE:
      return state.remove(action.recipeId);

    default:
      return state;
  }
}


function items(state = new Map(), action) {
  const formatRecipe = recipe =>
    recipe
      .set('action_id', recipe.getIn(['action', 'id'], null))
      .set('latest_revision_id', recipe.getIn(['latest_revision', 'id'], null))
      .set('approved_revision_id', recipe.getIn(['approved_revision', 'id'], null))
      .remove('action')
      .remove('latest_revision')
      .remove('approved_revision');

  switch (action.type) {
    case RECIPE_RECEIVE: {
      const recipe = fromJS(action.recipe);
      return state.set(action.recipe.id, formatRecipe(recipe));
    }

    case RECIPE_PAGE_RECEIVE: {
      const recipes = fromJS(action.recipes.results);
      let newState = state;

      recipes.forEach(receivedRecipe => {
        newState = newState.set(receivedRecipe.get('id'), formatRecipe(receivedRecipe));
      });

      return newState;
    }

    case RECIPE_DELETE:
      return state.remove(action.recipeId);

    default:
      return state;
  }
}


function listing(state = new Map(), action) {
  switch (action.type) {
    case RECIPE_PAGE_RECEIVE:
      return state
        .set('count', action.recipes.count)
        .set('pageNumber', action.pageNumber)
        .set('results', fromJS(action.recipes.results.map(result => result.id)));

    case RECIPE_LISTING_COLUMNS_CHANGE:
      return state.set('columns', RECIPE_LISTING_COLUMNS.filter(column => (
        action.columns.includes(column)
      )));

    default:
      return state;
  }
}


export default combineReducers({
  filters,
  history,
  items,
  listing,
});
