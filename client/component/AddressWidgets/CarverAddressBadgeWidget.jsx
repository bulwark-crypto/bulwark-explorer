import React from 'react';
import numeral from 'numeral';
import Icon from '../Icon';
import config from '../../../config'
import CarverAddressBadgeWidget from './CarverAddressBadgeWidget'

/**
 * All carver addreses displayed on website are wrapped around this component. Allows us to add metadata icons/text/badges, etc to addresses.
 */
const CarverAddressLabelWidget = ({ carverAddress, showBadge = true, ...props }) => {
  let badgeLabel = null;
  let badgeContext = 'info';

  const addressWidgets = config.addressWidgets[carverAddress.label];
  if (addressWidgets) {
    // Each carver address can have it's own label 
    const carverAddressLabelWidget = addressWidgets.carverAddressLabelWidget;
    if (carverAddressLabelWidget) {
      if (carverAddressLabelWidget.badge) {
        badgeLabel = carverAddressLabelWidget.badge.label;
        if (carverAddressLabelWidget.badge.context) {
          badgeContext = carverAddressLabelWidget.badge.context;
        }
      }
    }
  }

  const getBadge = () => {
    if (!badgeLabel) {
      return null;
    }
    return <span class={`address-badge address-badge-${badgeContext}`}>{badgeLabel}</span>
  }

  return (
    <span {...props}>
      {getBadge()}
    </span>
  );
}

export default CarverAddressLabelWidget;