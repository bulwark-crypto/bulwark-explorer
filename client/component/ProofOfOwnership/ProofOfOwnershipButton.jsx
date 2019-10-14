import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../core/Actions'

import config from '../../../config'

import { Button, Box, Typography, Divider } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import AddressLockedIcon from '@material-ui/icons/LockRounded';
import AddressUnlockedIcon from '@material-ui/icons/LockOpenRounded';


/**
 * All carver addreses displayed on website are wrapped around this component. Allows us to add metadata icons/text/badges, etc to addresses.
 * @todo redo to only accept label
 */
const ProofOfOwnershipButton = ({ lockedTitle, unlockedTitle, address, payload, loginAction, userState }) => {
  if (!config.offChainSignOn.enabled) {
    return null;
  }

  const isAddressLoggedIn = userState.addresses.some(userAddress => userAddress.address === address);

  const [open, setOpen] = React.useState(false);
  const [signature, setSignature] = React.useState('');
  const [error, setError] = React.useState(null);

  const message = `${config.offChainSignOn.signMessagePrefix}${payload}`;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isAddressLoggedIn) {
      return;
    }

    setError(null);

    if (!signature.trim()) {
      setError('Please enter a valid signature.');
      return;
    }

    loginAction({
      address,
      message,
      signature
    }).then((result) => {
      if (result.success) {
        setOpen(false);
      } else {
        setError('Invalid Signature. Please Ensure correct Address is Selected.');
      }
    }, (payload) => {
      const { error } = payload;
      if (error && error.message) {
        setError(error.message)
      } else {
        setError('Unable to verify signature.');
      }
    });
  }

  return (
    <Box>
      <Button variant="contained" color={isAddressLoggedIn ? 'secondary' : 'primary'} size="small" onClick={() => { setOpen(true); }}>
        {isAddressLoggedIn ? <AddressUnlockedIcon /> : <AddressLockedIcon />}
        {isAddressLoggedIn ? unlockedTitle : lockedTitle}
      </Button>
      <Dialog open={open} onClose={() => { setOpen(false); }} aria-labelledby="form-dialog-title">
        <form onSubmit={onSubmit}>
          <DialogTitle id="form-dialog-title">Off-Chain Sign On</DialogTitle>
          <DialogContent>
            <Box>{config.coinDetails.name} Address: <Box display="inline" fontWeight="fontWeightBold">{address}</Box></Box>
            <Box my={2}><Divider /></Box>
            <Box>
              <Typography>To use this functionality you must prove ownership of this address by signing the following message inside your wallet and pasting signature below: </Typography>
            </Box>
            <Box mt={1} mb={4}>
              <ol>
                <li>Select <Box display="inline" fontWeight={500}>File &gt; Sign Message</Box> in {config.coinDetails.name} wallet</li>
                <li>Select <Box display="inline" fontWeight={500}>{address}</Box> address </li>
                <li>Paste the <Box display="inline" fontWeight={500}>Message To Sign</Box> from below into the empty text area</li>
                <li>Click <Box display="inline" fontWeight={500}>Sign Message</Box> and Copy the Signature output below</li>
              </ol>
            </Box>
            <DialogContentText>
              <Box my={1}>
                <TextField
                  id="outlined-multiline-static"
                  label="Message To Sign"
                  defaultValue={message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
              <Box my={1}>
                <TextField
                  autoFocus
                  id="name"
                  label="Signature"
                  type="text"
                  variant="outlined"
                  onChange={(e) => setSignature(e.target.value)}
                  error={!!error}
                  helperText={error}
                  fullWidth
                />
              </Box>
            </DialogContentText>
            <Box my={2}><Divider /></Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpen(false); }}  >
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained" >
              Unlock
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

const mapDispatch = (dispatch, ownProps) => ({
  loginAction: query => Actions.login(dispatch, query),

});

const mapState = state => ({
  userState: state.user
})

export default connect(mapState, mapDispatch)(ProofOfOwnershipButton);