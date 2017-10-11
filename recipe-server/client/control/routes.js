import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { routerForBrowser } from 'redux-little-router';

import App from 'control/components/App';
import CreateExtensionPage from 'control/components/extensions/CreateExtensionPage';
import EditExtensionPage from 'control/components/extensions/EditExtensionPage';
import ApprovalHistoryPage from 'control/components/recipes/ApprovalHistoryPage';
import CreateRecipePage from 'control/components/recipes/CreateRecipePage';
import CloneRecipePage from 'control/components/recipes/CloneRecipePage';
import EditRecipePage from 'control/components/recipes/EditRecipePage';
import ExtensionListing from 'control/components/extensions/ExtensionListing';
import Gateway from 'control/components/pages/Gateway';
import RecipeListing from 'control/components/recipes/RecipeListing';
import MissingPage from 'control/components/pages/MissingPage';
import RecipeDetailPage from 'control/components/recipes/RecipeDetailPage';

import { Route, lilRouterize, replaceUrlVariables } from './routerUtils';

const routes = {
  '/': new Route('home', Gateway),

  '/recipe/': new Route('recipe-listing', RecipeListing),
  '/recipe/new/': new Route('create-recipe', CreateRecipePage),
  '/recipe/:recipeId/': new Route('view-recipe', RecipeDetailPage),
  '/recipe/:recipeId/edit/': new Route('edit-recipe', EditRecipePage),
  '/recipe/:recipeId/clone/': new Route('clone-recipe', CloneRecipePage),
  '/recipe/:recipeId/approval_history/': new Route('approval-history', ApprovalHistoryPage),
  '/recipe/:recipeId/rev/:revisionId/': new Route('view-revision', RecipeDetailPage),
  '/recipe/:recipeId/rev/:revisionId/clone/': new Route('clone-revision', CloneRecipePage),

  '/extension/': new Route('extension-listing', ExtensionListing),
  '/extension/new/': new Route('new-extension', CreateExtensionPage),
  '/extension/:extensionId/': new Route('view-extension', EditExtensionPage),
};


export const getNamedRoute = (name, params = {}) => {
  let url;
  for (const path in routes) {
    if (routes[path].slug === name) {
      url = path;
      break;
    }
  }

  if (url) {
    return replaceUrlVariables(url, params);
  }

  return null;
};

export const {
  reducer,
  middleware,
  enhancer,
} = routerForBrowser({
  routes: lilRouterize(routes),
  basename: '',
});

@connect(state => ({
  router: state.router,
}))
export default class Router extends React.PureComponent {
  static propTypes = {
    router: PropTypes.object.isRequired,
  };

  render() {
    const { router } = this.props;
    const content = router.route ? <router.result.component /> : <MissingPage />;
    return <App>{content}</App>;
  }
}
