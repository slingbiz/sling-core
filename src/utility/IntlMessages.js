import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

const InjectMassage = (props, ref) => <FormattedMessage {...props} ref={ref} />;

// Set forwardRef to true to ensure refs are forwarded properly
export default injectIntl(React.forwardRef(InjectMassage), {
  forwardRef: true, // Allow ref forwarding
});
