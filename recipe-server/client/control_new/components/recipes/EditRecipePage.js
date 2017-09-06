import { message } from 'antd';
import autobind from 'autobind-decorator';
import { is, Map } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingOverlay from 'control_new/components/common/LoadingOverlay';
import RecipeForm from 'control_new/components/recipes/RecipeForm';
import QueryRecipe from 'control_new/components/data/QueryRecipe';

import { addSessionView } from 'control_new/state/app/session/actions';

import { updateRecipe } from 'control_new/state/app/recipes/actions';
import { getRecipe } from 'control_new/state/app/recipes/selectors';
import { getRecipeForRevision } from 'control_new/state/app/revisions/selectors';
import { getUrlParamAsInt } from 'control_new/state/router/selectors';


@connect(
  state => {
    const recipeId = getUrlParamAsInt(state, 'recipeId');
    const recipe = getRecipe(state, recipeId, new Map());

    return {
      recipeId,
      recipe: getRecipeForRevision(state, recipe.getIn(['latest_revision', 'id']), new Map()),
    };
  },
  {
    addSessionView,
    updateRecipe,
  },
)
@autobind
export default class EditRecipePage extends React.PureComponent {
  static propTypes = {
    addSessionView: PropTypes.func.isRequired,
    updateRecipe: PropTypes.func.isRequired,
    recipeId: PropTypes.number.isRequired,
    recipe: PropTypes.instanceOf(Map),
  };

  static defaultProps = {
    recipe: null,
  };

  state = {
    formErrors: undefined,
  };

  componentDidMount() {
    const recipeName = this.props.recipe.get('name');
    if (recipeName) {
      this.props.addSessionView('recipe', recipeName);
    }
  }

  componentWillReceiveProps({ recipe }) {
    const oldRecipe = this.props.recipe;

    // New recipe means we add a session view.
    if (!is(oldRecipe, recipe)) {
      const recipeName = recipe.get('name');
      this.props.addSessionView('recipe', recipeName);
    }
  }

  /**
   * Update the existing recipe and display a message.
   */
  async handleSubmit(values) {
    const { recipeId } = this.props;

    try {
      await this.props.updateRecipe(recipeId, values);
      message.success('Recipe saved');
      this.setState({
        formErrors: undefined,
      });
    } catch (error) {
      message.error(
        'Recipe cannot be saved. Please correct any errors listed in the form below.',
      );

      if (error) {
        this.setState({
          formErrors: error.data || error,
        });
      }
    }
  }

  render() {
    const { recipe, recipeId } = this.props;

    return (
      <div className="edit-page">
        <QueryRecipe pk={recipeId} />
        <LoadingOverlay requestIds={`fetch-recipe-${recipeId}`}>
          <h2>Edit Recipe</h2>

          <RecipeForm
            recipe={recipe}
            onSubmit={this.handleSubmit}
            errors={this.state.formErrors}
          />
        </LoadingOverlay>
      </div>
    );
  }
}
