import React, { memo } from "react";
import { getFileName } from "../../../../../utils/operations";

const ImageMessageBlock = memo(({ message, user }) => {
  const height = Number(message.thumbnail_height ?? "200") / 1.5;
  const width = Number(message.thumbnail_width ?? "300") / 1.5;

  const fileName = getFileName(message.file);

  const openImage = () => {
    let d = new frappe.ui.Dialog({
      title: "Image",
      size: "large",
      fields: [
        {
          fieldname: "image",
          fieldtype: "HTML",
          read_only: 1,
          options: `<div style="margin-left: auto; margin-right: auto; text-align: center;"><img src="${message.file}" style="margin-left: auto; margin-right: auto; max-width: auto; max-height: 70vh;" /></div>`,
        },
      ],
      primary_action_label: "Download",
      primary_action() {
        window.open(message.file, "_blank");
      },
    });

    d.show();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        direction: "column",
        gap: "4px",
      }}
    >
      <div>
        <a
          href={message.file}
          target="_blank"
          className="raven-message-image-link"
          rel="noopener noreferrer"
        >
          {fileName}
        </a>
      </div>
      <div
        style={{
          position: "relative",
          height: `${height}px`,
          width: `${width}px`,
        }}
      >
        {/* Absolute positioned skeleton loader */}
        <div
          className="skeleton"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            height: `${height}px`,
            width: `${width}px`,
            borderRadius: "4px",
          }}
        ></div>

        <img
          src={message.file}
          loading="lazy"
          onClick={openImage}
          alt={`Image file sent by ${message.owner} at ${message.creation}`}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            cursor: "pointer",
            objectFit: "cover",
            minHeight: `${height}px`,
            minWidth: `${width}px`,
            borderRadius: "4px",
            maxHeight: `${height}px`,
            maxWidth: `${width}px`,
          }}
        />
      </div>
    </div>
  );
});

export default ImageMessageBlock;
