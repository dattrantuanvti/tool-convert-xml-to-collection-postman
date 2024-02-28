import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Space, Upload } from "antd";

const FileUpload = ({ onUpload }) => {
  const props = {
    name: "file",
    action:
      "https://tool-convert-xml-to-collection-postman.onrender.com/single",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status === "done") {
        onUpload(info);
        message.success(`${info.file.name} file đã được tải lên thành công!`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file tải lên thất bại!`);
      }
    },
    accept: ".dar.webapiset",
    maxCount: 1,
  };
  return (
    <Space size="large">
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Upload single file</Button>
      </Upload>
    </Space>
  );
};
export default FileUpload;
