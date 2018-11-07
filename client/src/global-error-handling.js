import { attachAnUnexpectedErrorLogger } from "redux-manager-lib";
attachAnUnexpectedErrorLogger();
document.addEventListener("unexpectedruntimeerror", reduxManagerLibError => {
  alert("Unexpected Runtime Error - Check the console");
});
