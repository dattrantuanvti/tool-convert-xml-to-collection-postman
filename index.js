const express = require("express");
const fs = require("node:fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = 8000;

const readFiles = async (files, folderName) => {
  const items = [];
  await files.forEach(async (file) => {
    const data = await fs.readFileSync(`${folderName}\\${file}`, {
      encoding: "binary",
    });
    items.push(data);
  });
  return items;
};

app.post("/single", upload.single("file"), async (req, res) => {
  const fileBuffer = req.file.buffer;
  // Đọc nội dung của tệp tin từ fileBuffer
  const fileContent = fileBuffer.toString("utf-8");

  return res.status(200).json(fileContent);
});

app.post("/folder", upload.any(), async (req, res) => {
  const files = req.files;
  // Đọc nội dung của tệp tin từ fileBuffer
  const output = files.map((item) => {
    return {
      name: item.originalname.split(".")[0],
      data: item.buffer.toString(),
    };
  });

  return res.status(200).json(output);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
