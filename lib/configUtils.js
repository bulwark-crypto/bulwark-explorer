import config from '../config'
// Allows to quickly find a matching config for this address
const getCommunityAddressConfig = (addressToFind) => {
    if (!config.addressWidgets || !config.addressWidgets) {
        return null;
    }

    return config.addressWidgets[addressToFind];
}
// Allows to quickly find a matching config for this widget in this address
const getCommunityAddressWidgetConfig = (addressToFind, widgetConfig) => {
    const communityAddressConfig = getCommunityAddressConfig(addressToFind);
    if (!communityAddressConfig) {
        return null;
    }
    const addressWidget = communityAddressConfig[widgetConfig];
    if (!addressWidget) {
        return null;
    }
    return addressWidget;
}


module.exports = {
    getCommunityAddressConfig,
    getCommunityAddressWidgetConfig
};