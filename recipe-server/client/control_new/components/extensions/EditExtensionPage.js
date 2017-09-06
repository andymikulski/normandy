import { message } from 'antd';
import autobind from 'autobind-decorator';
import { Map, is } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingOverlay from 'control_new/components/common/LoadingOverlay';
import QueryExtension from 'control_new/components/data/QueryExtension';
import ExtensionForm from 'control_new/components/extensions/ExtensionForm';
import {
  updateExtension as updateExtensionAction,
} from 'control_new/state/app/extensions/actions';
import { getExtension } from 'control_new/state/app/extensions/selectors';
import { getUrlParamAsInt } from 'control_new/state/router/selectors';
import { addSessionView as addSessionViewAction } from 'control_new/state/app/session/actions';

@connect(
  state => {
    const extensionId = getUrlParamAsInt(state, 'extensionId');
    const extension = getExtension(state, extensionId, new Map());
    return {
      extension,
      extensionId,
    };
  },
  {
    updateExtension: updateExtensionAction,
    addSessionView: addSessionViewAction,
  },
)
@autobind
export default class EditExtensionPage extends React.PureComponent {
  static propTypes = {
    extension: PropTypes.instanceOf(Map).isRequired,
    extensionId: PropTypes.number.isRequired,
    updateExtension: PropTypes.func.isRequired,
    addSessionView: PropTypes.func.isRequired,
  }

  state = {
    formErrors: {},
  };

  componentDidMount() {
    const extensionName = this.props.extension.get('name');
    if (extensionName) {
      this.props.addSessionView('extension', extensionName);
    }
  }

  componentWillReceiveProps({ extension }) {
    const oldExtensions = this.props.extension;

    // New extension means we add a session view.
    if (!is(oldExtensions, extension) && oldExtensions.get('name') !== extension.get('name')) {
      const extensionName = extension.get('name');
      this.props.addSessionView('extension', extensionName);
    }
  }

  /**
   * Update the existing extension and display a message.
   */
  async handleSubmit(values) {
    const { extensionId, updateExtension } = this.props;
    try {
      await updateExtension(extensionId, values);
      message.success('Extension saved');
    } catch (error) {
      message.error(
        'Extension cannot be saved. Please correct any errors listed in the form below.',
      );
      if (error.data) {
        this.setState({ formErrors: error.data });
      }
    }
  }

  render() {
    const { extension, extensionId } = this.props;
    const { formErrors } = this.state;
    return (
      <div>
        <QueryExtension pk={extensionId} />

        <h2>Edit Extension</h2>

        <LoadingOverlay>
          <ExtensionForm
            extension={extension}
            onSubmit={this.handleSubmit}
            errors={formErrors}
          />
        </LoadingOverlay>
      </div>
    );
  }
}
