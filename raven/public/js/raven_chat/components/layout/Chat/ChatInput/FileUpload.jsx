import React from 'react'

//TODO: This is not working yet
const FileUpload = ({ channelID }) => {

    const onClick = () => {
        new frappe.ui.FileUploader({
            doctype: "Raven Message",
            channelID: channelID,
            // docname: me.d,
            folder: "Home/Attachments",
            method: 'raven.api.upload_file.upload_file_with_message' + channelID,
            on_success(file_doc) {
                // me.attachments.attachment_uploaded(file_doc);
            },
        });
    }
    return <button className='btn btn-xs icon-btn btn-default' onClick={onClick}>
        <svg className="es-icon ml-0 icon-sm">
            <use href="#es-line-attachment"></use>
        </svg>
    </button>
}


export default FileUpload