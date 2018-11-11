import React from "react";
import * as _ from "ramda";
import { Link } from "react-router-dom";
import Typography from "@material-ui/core/Typography/Typography";
import { withRouter } from "react-router";

class _Breadcrumbs extends React.Component {
  render() {
    let noEmpty = this.props.location.pathname.split("/").filter(s => s !== "");
    let allBreadcrumbs = _.prepend("", noEmpty);

    const constructPath = index => {
      if (index === 0) {
        return "/";
      } else {
        return _.take(index + 1, allBreadcrumbs).reduce((acc, br, i) => {
          if (i === 0) {
            return acc;
          } else {
            return acc + br + "/";
          }
        }, "/");
      }
    };

    let links = allBreadcrumbs.map((e, i) => {
      let to = constructPath(i);
      return <Link to={to}>{e || "home"} / </Link>;
    });

    return (
      <div key={this.props.location.pathname} style={{ padding: 20 }}>
        <Typography variant="body1" color="inherit">
          {links}
        </Typography>
      </div>
    );
  }
}

const Breadcrumbs = withRouter(_Breadcrumbs);
export default Breadcrumbs;
