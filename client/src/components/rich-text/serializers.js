import Html from "slate-html-serializer";
import React from "react";

const BLOCK_TAGS = {
  blockquote: "quote",
  p: "paragraph",
  pre: "code"
};

const MARK_TAGS = {
  em: "italic",
  strong: "bold",
  u: "underline"
};

const rules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: "block",
          type: type,
          data: {
            className: el.getAttribute("class")
          },
          nodes: next(el.childNodes)
        };
      }
    },
    serialize(obj, children) {
      if (obj.object == "block") {
        switch (obj.type) {
          case "code":
            return (
              <pre>
                <code>{children}</code>
              </pre>
            );
          case "paragraph":
            return <p className={obj.data.get("className")}>{children}</p>;
          case "quote":
          case "block-quote":
            return <blockquote>{children}</blockquote>;
        }
      }
    }
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: "mark",
          type: type,
          nodes: next(el.childNodes)
        };
      }
    },
    serialize(obj, children) {
      if (obj.object == "mark") {
        switch (obj.type) {
          case "bold":
            return <strong>{children}</strong>;
          case "italic":
            return <em>{children}</em>;
          case "underline":
            return <u>{children}</u>;
          case "code":
            return (
              <pre>
                <code>{children}</code>
              </pre>
            );
        }
      }
    }
  }
];

const html = new Html({ rules });
export { html };

const initialValue = {
  document: {
    nodes: [
      {
        object: "block",
        type: "paragraph",
        nodes: [
          {
            object: "text",
            leaves: [
              {
                text: "This is editable "
              },
              {
                text: "rich",
                marks: [
                  {
                    type: "bold"
                  }
                ]
              },
              {
                text: " text, "
              },
              {
                text: "much",
                marks: [
                  {
                    type: "italic"
                  }
                ]
              },
              {
                text: " better than a "
              },
              {
                text: "<textarea>",
                marks: [
                  {
                    type: "code"
                  }
                ]
              },
              {
                text: "!"
              }
            ]
          }
        ]
      },
      {
        object: "block",
        type: "paragraph",
        nodes: [
          {
            object: "text",
            leaves: [
              {
                text:
                  "Since it's rich text, you can do things like turn a selection of text "
              },
              {
                text: "bold",
                marks: [
                  {
                    type: "bold"
                  }
                ]
              },
              {
                text:
                  ", or add a semantically rendered block quote in the middle of the page, like this:"
              }
            ]
          }
        ]
      },
      {
        object: "block",
        type: "block-quote",
        nodes: [
          {
            object: "text",
            leaves: [
              {
                text: "A wise quote."
              }
            ]
          }
        ]
      },
      {
        object: "block",
        type: "paragraph",
        nodes: [
          {
            object: "text",
            leaves: [
              {
                text: "Try it out for yourself!"
              }
            ]
          }
        ]
      }
    ]
  }
};

export { initialValue };

const initialEmptyValue = {
  document: {
    nodes: [
      {
        object: "block",
        type: "paragraph",
        nodes: [
          {
            object: "text",
            leaves: [
              {
                text: ""
              }
            ]
          }
        ]
      }
    ]
  }
};
export { initialEmptyValue };
