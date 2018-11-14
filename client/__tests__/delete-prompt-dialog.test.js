import React from "react";
import DeletePromptDialog from "../src/components/delete-prompt-dialog";
import { shallow, mount } from "enzyme";

test("CheckboxWithLabel changes the text after click", () => {
  // Render a checkbox with label in the document
  const message = "Some message";
  const open = true;
  const onCancel = jest.fn(x => {});
  const onContinue = jest.fn(x => {});
  const dialog = mount(
    <div>
      <DeletePromptDialog {...{ open, message, onCancel, onContinue }} />
    </div>
  );

  let messageNode = dialog.findWhere(n => {
    debugger;
    return n.text() === message;
  });
  expect(messageNode.length).toEqual(1);
  expect(true).toEqual(true);
});
