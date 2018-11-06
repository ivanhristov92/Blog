import React from "react";
import MUIDataTable from "mui-datatables";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { equals } from "ramda";

export default class ModelEntriesList extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !equals(nextProps.data, this.props.data);
  }

  render() {
    const options = {
      filterType: "checkbox",
      sort: true,
      customToolbarSelect: () => (
        <div style={{ display: "flex" }}>
          <Tooltip title={"opsa"}>
            <IconButton onClick={this.props.onEditClick}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={"opsa"}>
            <IconButton onClick={this.props.onDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),

      onRowsSelect: this.props.onRowsSelect,

      onRowsDelete: this.props.onRowDelete
    };

    let columns = this.props.fields;
    let data = this.props.data;
    let title = this.props.modelName;

    console.log(this.state);
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
