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

type Id = number;
type Title = string;
type Content = string;

export type Props = {
  title: string,
  columns: Array<string>,
  entries: Array<Array<Id & Title & Content>>,
  rowsSelected: Array<number>,
  isPreviewingActive: boolean,
  onPreviewClicked: Function,
  onCreateClicked: Function,
  isEditingActive: boolean,
  onEditClicked: Function,
  onDeleteClicked: Function,
  onRowsSelected: Function
};

export default class ModelEntriesList extends React.Component<Props> {
  render() {
    const options = {
      filterType: "checkbox",
      sort: true,
      customToolbarSelect: this.renderCustomToolbarSelect,
      customToolbar: this.renderCustomToolbar,
      onRowsSelect: this.props.onRowsSelected,
      rowsSelected: this.props.rowsSelected
    };

    return (
      <div className="model-list-wrapper">
        <MUIDataTable
          title={this.props.title}
          data={this.props.entries}
          columns={this.props.columns}
          options={options}
        />
      </div>
    );
  }

  renderCustomToolbarSelect = () => (
    <div className={"custom-toolbar-select-wrapper"}>
      <Tooltip title={"Preview"}>
        <IconButton onClick={this.props.onPreviewClicked}>
          {this.props.isPreviewingActive ? (
            <VisibilityOffIcon />
          ) : (
            <VisibilityIcon />
          )}
        </IconButton>
      </Tooltip>

      <Tooltip title={this.props.isEditingActive ? "Cencel Editing" : "Edit"}>
        <IconButton onClick={this.props.onEditClicked}>
          {this.props.isEditingActive ? <CancelIcon /> : <EditIcon />}
        </IconButton>
      </Tooltip>

      <Tooltip title={"Delete"}>
        <IconButton onClick={this.props.onDeleteClicked}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );

  renderCustomToolbar = () => (
    <Button
      variant="fab"
      color="primary"
      aria-label="Add"
      onClick={this.props.onCreateClicked}
    >
      <AddIcon />
    </Button>
  );
}
