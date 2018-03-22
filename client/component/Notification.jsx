
import React from 'react';

const Notification = () => (
  <div className="alert alert-primary pulse text-center" style={{ fontSize: '1em' }}>
    <div style={{ fontSize: '1.25em', fontWeight: 'bold' }}>
      Please update all of your local wallets and masternodes to the latest
      version 1.2.3 as soon as possible.
    </div>
    <div>
      <a
        className="btn btn-primary"
        href="https://bulwarkcrypto.com/#section-downloads"
        target="_blank">
        Download
      </a>
    </div>
  </div>
);

export default Notification;
