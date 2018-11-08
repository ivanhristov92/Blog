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

type CustomToolbarRelatedProps = {
  isPreviewingActive: boolean,
  onPreviewClicked: Function,
  isEditingActive: boolean,
  onEditClicked: Function,
  onDeleteClicked: Function,
  onCreateClicked: Function
};

type DataAndSelectionRelatedProps = {
  columns: Array<string>,
  entries: Array<Array<Id & Title & Content>>,
  rowsSelected: Array<number>,
  onRowsSelected: Function
};

export type Props = {
  title: string
} & DataAndSelectionRelatedProps &
  CustomToolbarRelatedProps;

export default class ModelEntriesList extends React.Component<Props> {
  render() {
    /**
     * Custom options for MUIDataTable
     */
    const tableOptions = {
      filterType: "checkbox",
      sort: true,
      customToolbarSelect: this.renderCustomToolbarSelect,
      customToolbar: this.renderAdditionalControlsInToolbar,
      onRowsSelect: this.props.onRowsSelected,
      rowsSelected: this.props.rowsSelected
    };

    return (
      <div className="model-list-wrapper">
        <MUIDataTable
          title={this.props.title}
          data={this.props.entries}
          columns={this.props.columns}
          options={tableOptions}
        />
      </div>
    );
  }

  /**
   * Renders 'preview', 'and' and 'delete' controls
   */
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

  /**
   * Adds controls to the toolbar
   */
  renderAdditionalControlsInToolbar = () => (
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
