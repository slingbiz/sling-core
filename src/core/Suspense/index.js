import React from "react";
import PropTypes from "prop-types";
import Loader from "../Loader";

const Suspense = (props) => {
  return (
    <React.Suspense fallback={<Loader />}>{props.children}</React.Suspense>
  );
};

Suspense.propTypes = {
  loadingProps: PropTypes.object,
};

 
export default Suspense;

Suspense.propTypes = {
  children: PropTypes.node.isRequired,
};
