import React from 'react';
import { Text, View } from 'native-base';
import PropTypes from 'prop-types';

export default class Banner extends React.Component {
  bgStyle() {
    let bgColor = '#FEFEFE';
    if (this.props.success) bgColor = '#0A0';
    else if (this.props.error) bgColor = '#A00';

    return {
      backgroundColor: bgColor,
      paddingLeft: 10,
      paddingRight: 10,
      paddingBottom: 2,
      marginBottom: 10,
      borderRadius: 10,
    };
  }

  textStyle() {
    let textColour = 'black';
    if (this.props.success || this.props.error) textColour = 'white';

    return {
      color: textColour,
    };
  }

  render() {
    return (
      <View style={this.bgStyle()}>
        <Text style={this.textStyle()}>{this.props.message}</Text>
      </View>
    );
  }
}

Banner.defaultProps = {
  success: false,
  error: false,
};

Banner.propTypes = {
  success: PropTypes.bool,
  error: PropTypes.bool,
};
