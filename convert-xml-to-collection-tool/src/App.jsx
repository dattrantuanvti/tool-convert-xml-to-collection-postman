import { Button, Card, Col, Input, Row, Space, Tabs, message } from "antd";
import "./App.css";
import FileUpload from "./file-upload";
import { convertXmlToCollection } from "../utils/convertXmlToCollection";
import { useState } from "react";
import axios from "axios";

const initData = {
  info: {
    _postman_id: "8792db4d-d865-42c1-9fcd-94ab49284740",
    name: "USMH-auto-collection",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: null,
  event: [
    {
      listen: "prerequest",
      script: {
        type: "text/javascript",
        exec: [""],
      },
    },
    {
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [""],
      },
    },
  ],
  variable: [
    {
      key: "URL",
      value: "http://13.112.81.234:65443",
    },
  ],
};

function App() {
  const [textCollection, setTextCollection] = useState("");

  const handleUpload = (info) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      const scenarioName = info.file.name.split(".")[0];
      const items = convertXmlToCollection(e.target.result, scenarioName);
      const newData = { ...initData };
      newData.item = items;
      setTextCollection(JSON.stringify(newData));
    };
    reader.readAsText(info.file.originFileObj);
  };

  const handleDownload = () => {
    if (!textCollection) {
      return message.error(`Bạn chưa chọn file xml cần convert!`);
    }
    const element = document.createElement("a");
    const file = new Blob([textCollection], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "collection.json";
    document.body.appendChild(element);
    element.click();
  };

  const handleDirectoryChange = async (event) => {
    const files = event.target.files;
    const formDataArr = new FormData();
    [...files].forEach((item, index) => {
      formDataArr.append(index, files[index], item.name);
    });
    const folderData = await axios.post(
      "http://localhost:8000/folder",
      formDataArr
    );

    const items = folderData.data.map((fileData) => {
      return convertXmlToCollection(fileData.data, fileData.name);
    });

    const newData = { ...initData };
    newData.item = items;
    setTextCollection(JSON.stringify(newData));
  };
  const items = [
    {
      key: "1",
      label: "File",
      children: (
        <Space direction="vertical" size="large">
          <FileUpload onUpload={handleUpload} />
          <Button onClick={handleDownload}>Download data</Button>
        </Space>
      ),
    },
    {
      key: "2",
      label: "Read from scenario",
      children: (
        <Space direction="vertical" size="middle">
          <Input
            type="file"
            webkitdirectory="true"
            onChange={handleDirectoryChange}
          />
          <Button onClick={handleDownload} style={{ alignSelf: "flex-start" }}>
            Download
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <>
      <Row
        style={{
          height: "100vh",
          background: "#000",
          justifyContent: "center",
        }}
      >
        <Col
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <Card
            style={{ maxHeight: 460, width: 520, overflow: "auto" }}
            title="Tool convert xml to collection of postman"
          >
            <Tabs defaultActiveKey="1" items={items} />
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default App;