import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  appsSidebar: {
    height: "100%",
  },
  appsMainContent: (props) => ({
    width: "100%",
    display: "flex",
    flexDirection: "column",
  }),
  menuButton: {
    marginRight: theme.spacing(2),
  },
  menuIcon: {
    width: 35,
    height: 35,
  },
  appSidebarDrawer: {
    width: "19rem",
    "& .listItem": {
      zIndex: 1305,
    },
  },
  scLauncher: {
    "& .sc-header, & .sc-message--content.sent .sc-message--text, & .sc-header--close-button:hover":
      {
        backgroundColor: `${theme.palette.primary.main} !important`,
      },
  },
}));
export default useStyles;
