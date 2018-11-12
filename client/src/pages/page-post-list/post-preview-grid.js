import React from "react";
import GridList from "@material-ui/core/GridList/GridList";
import GridListTile from "@material-ui/core/GridListTile/GridListTile";
import Card from "./single-post-preview-card";

export default class PostPreviewGrid extends React.Component {
  render() {
    let { entries, navigateToPost } = this.props;
    return (
      <div>
        <GridList cellHeight={"auto"} cols={3}>
          {entries.map(entry => (
            <GridListTile key={entry.id} cols={1}>
              <Card
                title={entry.title}
                src={entry.featuredImage}
                excerpt={entry.excerpt}
                onActionAreaClicked={() => {
                  navigateToPost(entry.id);
                }}
              />
            </GridListTile>
          ))}
        </GridList>
      </div>
    );
  }
}
