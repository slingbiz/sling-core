import React from "react";
import Grid from "@material-ui/core/Grid";

const DefaultContent = (props) => {
  return (
    <Grid
      container
      justifyContent={"center"}
      width={"100%"}
      alignItems="baseline"
      flexDirection="row"
    >
      {props.children}
    </Grid>
  );
};

export default DefaultContent;
