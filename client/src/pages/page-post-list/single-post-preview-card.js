import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import placeholder from "../../images/placeholder.jpg";

function ImgMediaCard(props) {
  return (
    <Card className={"post-preview-card"}>
      <CardActionArea onClick={props.onActionAreaClicked}>
        <CardMedia
          component="img"
          height="140"
          image={props.src || "/" + placeholder}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {props.title}
          </Typography>
          <Typography component="p">
            <div dangerouslySetInnerHTML={{ __html: props.excerpt }} />
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={props.onActionAreaClicked}
        >
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}

export default ImgMediaCard;
