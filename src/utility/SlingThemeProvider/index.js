import React, { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import MomentUtils from "@date-io/moment";
import { ThemeProvider } from "@material-ui/core/styles";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

import AppContext from "../AppContext";
import { createTheme } from "@material-ui/core/styles";

import { responsiveFontSizes } from "@material-ui/core";
import { isBreakPointDown } from "../Utils";
import { ThemeStyle } from "../constants/AppEnums";
import { useUrlSearchParams } from "use-url-search-params";
const themeDef = createTheme({
  typography: {
    fontFamily: "Open Sans, sans-serif",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          fontFamily: "Open Sans, sans-serif",
        },
      },
    },
  },
});

const SlingThemeProvider = (props) => {
  const {
    theme,
    isRTL,
    updateThemeMode,
    changeNavStyle,
    updateThemeStyle,
    setRTL,
    updateTheme,
    locale,
  } = useContext(AppContext);
  const { appLocale } = props;
  const { muiLocale } = appLocale[locale.locale];

  const [params] = useUrlSearchParams({});

  useEffect(() => {
    const updateQuerySetting = () => {
      if (params.theme_mode) {
        updateThemeMode(params.theme_mode);
      }
    };
    updateQuerySetting();
  }, [params.theme_mode, updateThemeMode]);

  useEffect(() => {
    const updateQuerySetting = () => {
      if (params.is_rtl) {
        setRTL(params.is_rtl);
      }
      if (params.is_rtl || isRTL) {
        document.body.setAttribute("dir", "rtl");
      } else {
        document.body.setAttribute("dir", "ltr");
      }
    };
    updateQuerySetting();
  }, [isRTL, params.is_rtl, setRTL]);

  useEffect(() => {
    const updateQuerySetting = () => {
      if (params.nav_style) {
        changeNavStyle(params.nav_style);
      }
    };
    updateQuerySetting();
  }, [changeNavStyle, params.nav_style]);

  useEffect(() => {
    const updateQuerySetting = () => {
      if (params.theme_style) {
        if (params.theme_style === ThemeStyle.MODERN) {
          if (isBreakPointDown("md")) {
            theme.overrides.MuiCard.root.borderRadius = 20;
            theme.overrides.MuiToggleButton.root.borderRadius = 20;
          } else {
            theme.overrides.MuiCard.root.borderRadius = 30;
            theme.overrides.MuiToggleButton.root.borderRadius = 30;
          }
          theme.overrides.MuiButton.root.borderRadius = 30;
          theme.overrides.MuiCardLg.root.borderRadius = 50;
        } else {
          theme.overrides.MuiCard.root.borderRadius = 4;
          theme.overrides.MuiToggleButton.root.borderRadius = 4;
          theme.overrides.MuiButton.root.borderRadius = 4;
          theme.overrides.MuiCardLg.root.borderRadius = 4;
        }
        updateTheme(theme);
        updateThemeStyle(params.theme_style);
      }
    };
    updateQuerySetting();
  }, [params.theme_style, theme, updateTheme, updateThemeStyle]);

  // Merging custom theme with MUI locale-specific settings
  const mergedTheme = createTheme({
    ...theme,
    ...muiLocale, // Material-UI locale settings
    // typography: {
    //   ...theme.typography,
    //   fontFamily: "Open Sans, sans-serif", // Set Open Sans as default font
    // },
    ...themeDef, // Your custom theme
  });
  console.log(JSON.stringify(theme), "mergedTheme");
  return (
    <ThemeProvider theme={responsiveFontSizes(mergedTheme)}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        {props.children}
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default React.memo(SlingThemeProvider);

SlingThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
