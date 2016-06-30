import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock';

import { fixtureRecipes, fixtureRevisions, initialState } from '../fixtures/fixtures';
import * as actionTypes from '../../static/control/js/actions/ControlActions'

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore({ controlApp: initialState });

const successPromise = (responseData) => {
  return Promise.resolve(new Response(JSON.stringify(responseData), {
    Headers: 'Content-Type: application/json',
    status: 200
  }));
}

const failurePromise = () => {
  return Promise.resolve(new Response('{}', {
    Headers: 'Content-Type: application/json',
    status: 403
  }));
}


describe('controlApp Actions', () => {

  beforeEach(() => {
    store.clearActions();
    fetchMock.restore();
  });

  afterEach(() => {
    expect(fetchMock.calls().unmatched).toEqual([]);
  });

  it('creates REQUEST_IN_PROGRESS when initiating an api call', () => {
    const expectedAction = { type: actionTypes.REQUEST_IN_PROGRESS };
    fetchMock.mock('/api/v1/recipe/', 'GET', fixtureRecipes);

    return store.dispatch(actionTypes.makeApiRequest('fetchAllRecipes'))
    .then(() => {
      expect(store.getActions()).toContain(expectedAction);
    });
  })

  describe('creates REQUEST_COMPLETE when an api response is returned', () => {

    it('returns with `status: success` if the request succeeded', () => {
      const expectedAction = { type: actionTypes.REQUEST_COMPLETE, status: 'success' };
      fetchMock.mock('/api/v1/recipe/', 'GET', fixtureRecipes);

      return store.dispatch(actionTypes.makeApiRequest('fetchAllRecipes'))
      .then(() => {
        expect(store.getActions()).toContain(expectedAction);
      });
    })

    it('returns with `status: error` if the request failed', () => {
      const expectedAction = { type: actionTypes.REQUEST_COMPLETE, status: 'error' };
      fetchMock.mock('/api/v1/recipe/', 'GET', {status: 500});

      return store.dispatch(actionTypes.makeApiRequest('fetchAllRecipes'))
      .catch(() => {
        expect(store.getActions()).toContain(expectedAction);
      });
    });

    it('creates a SET_NOTIFICATION action if provided', () => {
      const expectedAction = { type: actionTypes.SET_NOTIFICATION, notification: { messageType: 'error', 'message': 'Error fetching recipes.'} };
      fetchMock.mock('/api/v1/recipe/', 'GET', {status: 500});

      return store.dispatch(actionTypes.makeApiRequest('fetchAllRecipes')).catch(() => {
        expect(store.getActions()).toContain(expectedAction);
      });
    });
  })

  it('makes a proper API request for fetchAllRecipes', () => {
    fetchMock.mock('/api/v1/recipe/', 'GET', fixtureRecipes);

    return store.dispatch(actionTypes.makeApiRequest('fetchAllRecipes'))
    .then((response) => {
      expect(fetchMock.calls('/api/v1/recipe/').length).toEqual(1);
    });
  });

  it('makes a proper API request for fetchSingleRecipe', () => {
    fetchMock.mock('/api/v1/recipe/1/', 'GET', fixtureRecipes[0]);

    return store.dispatch(actionTypes.makeApiRequest('fetchSingleRecipe', { recipeId: 1 }))
    .then((response) => {
      expect(fetchMock.calls('/api/v1/recipe/1/').length).toEqual(1);
    })
  });

  it('makes a proper API request for fetchSingleRevision', () => {
    fetchMock.mock('/api/v1/recipe_version/169/', 'GET', fixtureRecipes[0]);

    return store.dispatch(actionTypes.makeApiRequest('fetchSingleRevision', { revisionId: 169 }))
    .then((response) => {
      expect(fetchMock.calls('/api/v1/recipe_version/169/').length).toEqual(1);
    })
  });

  it('makes a proper API request for addRecipe', () => {
    fetchMock.mock('/api/v1/recipe/', 'POST', fixtureRecipes[0]);

    return store.dispatch(actionTypes.makeApiRequest('addRecipe', { recipe: fixtureRecipes[0] }))
    .then((response) => {
      const calls = fetchMock.calls('/api/v1/recipe/');
      expect(calls[0][1].body).toEqual(JSON.stringify(fixtureRecipes[0]));
    })
  });

  it('makes a proper API request for updateRecipe', () => {
    fetchMock.mock('/api/v1/recipe/1/', 'PATCH', fixtureRecipes[0]);

    return store.dispatch(actionTypes.makeApiRequest('updateRecipe', { recipe: fixtureRecipes[0], recipeId: 1 }))
    .then((response) => {
      const calls = fetchMock.calls('/api/v1/recipe/1/');
      expect(calls[0][1].body).toEqual(JSON.stringify(fixtureRecipes[0]));
    })
  });

  it('makes a proper API request for deleteRecipe', () => {
    fetchMock.mock('/api/v1/recipe/1/', 'DELETE', fixtureRecipes[0]);

    return store.dispatch(actionTypes.makeApiRequest('deleteRecipe', { recipeId: 1 }))
    .then((response) => {
      expect(fetchMock.calls('/api/v1/recipe/1/').length).toEqual(1);
    })
  });

})
