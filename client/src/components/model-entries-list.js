// @flow

import React from "react";
import MUIDataTable from "mui-datatables";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button/Button";
import AddIcon from "@material-ui/icons/Add";
import VisibilityIcon from "@material-ui/icons/Visibility";
import CancelIcon from "@material-ui/icons/Cancel";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import { Link } from "react-router-dom";

type Id = number;
type Title = string;
type Content = string;

export type Props = {
  entries: Array<Array<Id & Title & Content>>
};

export default class ModelEntriesList extends React.Component {
  props: Props;

  render() {
    const options = {
      filterType: "checkbox",
      sort: true,
      customToolbarSelect: () => (
        <div style={{ display: "flex" }}>
          <Tooltip title={"opsa"}>
            <IconButton onClick={this.props.onPreviewClick}>
              {this.props.isPreview ? (
                <VisibilityOffIcon />
              ) : (
                <VisibilityIcon />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={this.props.isEditing ? "Cencel Editing" : "Edit"}>
            <IconButton onClick={this.props.onEditClicked}>
              {this.props.isEditing ? <CancelIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={"opsa"}>
            <IconButton onClick={this.props.onDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),

      customToolbar: () => (
        <Button
          variant="fab"
          color="primary"
          aria-label="Add"
          onClick={this.props.onCreateClicked}
        >
          <AddIcon />
        </Button>
      ),
      onRowsSelect: this.props.onRowsSelect,

      onRowsDelete: this.props.onRowDelete,
      rowsSelected: this.props.rowsSelected
    };

    let columns = this.props.fields;
    let data = this.props.data;
    let title = this.props.modelName;

    return (
      <div className="model-list-wrapper">
        <MUIDataTable
          ref={table => {
            this.table = table;
          }}
          title={title}
          data={data}
          columns={columns}
          options={options}
        />
      </div>
    );
  }
}
