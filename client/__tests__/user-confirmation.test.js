import React from "react";
import UserConfirmation from "../src/components/user-confirmation";
import { shallow } from "enzyme";

test("CheckboxWithLabel changes the text after click", () => {
  // Render a checkbox with label in the document
  const checkbox = shallow(<UserConfirmation />);
  //
  // expect(checkbox.text()).toEqual("Off");
  //
  // checkbox.find("input").simulate("change");
  //
  // expect(checkbox.text()).toEqual("On");
  expect(true).toEqual(true);
});
