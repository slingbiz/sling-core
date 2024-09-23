import React, { useContext } from "react";
import { onToggleAppDrawer } from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import InfoView from "../../core/InfoView";
import { Box } from "@material-ui/core";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import PropTypes from "prop-types";
import AppEnums from "../../utility/constants/AppEnums";
const { Fonts } = AppEnums;
import Card from "@material-ui/core/Card";
import useStyles from "./index.style";
import AppSidebar from "../AppSidebar";
import AppContext from "../../utility/AppContext";

const AppsContainer = (props) => {
  const dispatch = useDispatch();
  const { isAppDrawerOpen } = useSelector(({ common }) => common);
  const { footer, navStyle } = useContext(AppContext);
  // eslint-disable-next-line react/prop-types
  const { title, sidebarContent, fullView, children } = props;
  const classes = useStyles({ footer, navStyle, fullView });

  return (
    <Box pt={{ xl: 4 }} flex={1} display="flex" flexDirection="column">
      <Box
        mb={{ xs: fullView ? 4 : 2, lg: fullView ? 5 : 4 }}
        mt={{ xs: fullView ? 0 : -3, lg: 0 }}
        display="flex"
        alignItems="center"
      >
        {fullView ? null : (
          <Hidden lgUp>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="open drawer"
              onClick={() => dispatch(onToggleAppDrawer())}
            >
              <MenuIcon className={classes.menuIcon} />
            </IconButton>
          </Hidden>
        )}
        <Box
          component="h2"
          color="text.primary"
          fontWeight={Fonts.BOLD}
          fontSize={16}
        >
          {title}
        </Box>
      </Box>

      <Box className={classes.appsContainer}>
        {sidebarContent ? (
          <AppSidebar
            isAppDrawerOpen={isAppDrawerOpen}
            footer={footer}
            fullView={fullView}
            navStyle={navStyle}
            sidebarContent={sidebarContent}
          />
        ) : null}

        <Box className={classes.appsMainContent}>
          <Card
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              ...props.cardStyle,
            }}
          >
            {children}
          </Card>
          <InfoView />
        </Box>
      </Box>
    </Box>
  );
};

export default AppsContainer;

AppsContainer.prototype = {
  title: PropTypes.string,
};
