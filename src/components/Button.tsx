import * as React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { green } from '@material-ui/core/colors'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
    buttonSuccess: {
      backgroundColor: green[500],
      '&:hover': {
        backgroundColor: green[700],
      },
    },
    buttonProgress: {
      color: green[500],
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
  }),
)

interface Props {
  loading: boolean
  disabled: boolean
  onClick: any
  success: boolean
  message: string
  successMessage: string
}

const ButtonComponent: React.FC<Props> = ({
  loading,
  disabled,
  onClick,
  success,
  message,
  successMessage,
}) => {
  const classes = useStyles()
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  })

  return (
    <div className={classes.wrapper}>
      <Button
        variant="contained"
        color="primary"
        className={buttonClassname}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {success ? successMessage : message}
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  )
}

export default ButtonComponent
