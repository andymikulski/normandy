import { fromJS, Map } from 'immutable';
import { combineReducers } from 'redux';

import {
  APPROVAL_REQUEST_CREATE,
  APPROVAL_REQUEST_DELETE,
  RECIPE_DELETE,
  RECIPE_HISTORY_RECEIVE,
  REVISION_RECEIVE,
} from 'control_new/state/action-types';

const formatRevision = revision =>
  revision
    .setIn(['recipe', 'action_id'], revision.getIn(['recipe', 'action', 'id'], null))
    .removeIn(['recipe', 'action'])
    .set('approval_request_id', revision.getIn(['approval_request', 'id'], null))
    .remove('approval_request')
    .set('user_id', revision.getIn(['user', 'id'], null))
    .remove('user');

function items(state = new Map(), action) {
  switch (action.type) {
    case RECIPE_HISTORY_RECEIVE: {
      const revisions = fromJS(action.revisions);
      let newState = state;

      revisions.forEach(revision => {
        const newRevision = formatRevision(revision);

        newState = newState.set(revision.get('id'), newRevision);
      });

      return newState;
    }

    case REVISION_RECEIVE: {
      let revision = fromJS(action.revision);
      revision = formatRevision(revision);

      return state.set(action.revision.id, revision);
    }

    case RECIPE_DELETE:
      return state.filterNot(item => item.getIn(['recipe', 'id']) === action.recipeId);

    case APPROVAL_REQUEST_CREATE:
      return state.update(action.revisionId, item => (
        item.set('approval_request_id', action.approvalRequest.id)
      ));

    case APPROVAL_REQUEST_DELETE:
      return state.map(item => {
        if (item.get('approval_request_id') === action.approvalRequestId) {
          return item.set('approval_request_id', null);
        }
        return item;
      });

    default:
      return state;
  }
}


export default combineReducers({
  items,
});
