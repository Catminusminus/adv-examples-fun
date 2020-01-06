import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import GitHubIcon from '@material-ui/icons/GitHub'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'

const Header = () => (
  <AppBar position="sticky">
    <Toolbar>
      <Typography>Generate Adversarial Examples for Fun and Profit!</Typography>
      <Tooltip title="GitHub repository" aria-label="GitHub repository">
        <IconButton
          aria-label="Open Github"
          color="inherit"
          href="https://github.com/Catminusminus/adv-examples-fun"
          target="_blank"
          rel="noopener"
        >
          <GitHubIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  </AppBar>
)

export default Header
