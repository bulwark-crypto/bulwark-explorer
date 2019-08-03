import React from 'react';
import numeral from 'numeral';
import Icon from '../Icon';
import config from '../../../config'

/**
 * All carver addreses displayed on website are wrapped around this component. Allows us to add metadata icons/text/badges, etc to addresses.
 */
const CarverAddressLabelWidget = ({ carverAddress }) => {
  let addressLabel = carverAddress.label;
  let addressTitle = null;

  const addressWidgets = config.addressWidgets[addressLabel];
  if (addressWidgets) {
    // Each carver address can have it's own label 
    const carverAddressLabelWidget = addressWidgets.carverAddressLabelWidget;
    if (carverAddressLabelWidget) {
      if (carverAddressLabelWidget.label) {
        addressLabel = carverAddressLabelWidget.label
      }
      if (carverAddressLabelWidget.title) {
        addressTitle = carverAddressLabelWidget.title
      }
    }
  }
  return (
    <span title={addressTitle}>
      {addressLabel}
    </span>
  );
}

export default CarverAddressLabelWidget;