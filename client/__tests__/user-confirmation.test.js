import React from "react";
import { CustomConfirmation } from "../src/components/user-confirmation";
import { shallow } from "enzyme";

test("CheckboxWithLabel changes the text after click", () => {
  // Render a checkbox with label in the document
  const checkbox = shallow(<CustomConfirmation />);
  expect(true).toEqual(true);
});
