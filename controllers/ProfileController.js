const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ProfileService = require("../services/ProfileService");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/uploads"),
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 3, // to allow only max 5 mb file
  },
}).single("image");

router.post("/profile", async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ Error: err.message });
      } else if (err) {
        return res.status(500).json({ Error: err.message });
      } else {
        const { userName, email, walletId } = req.body;

        let fieldname,
          originalname,
          encoding,
          mimetype,
          filename,
          destination,
          path;
        size = "";
        if (req.file) {
          const fileData = req.file;
          encoding = fileData.encoding;
          fieldname = fileData.fieldname;
          mimetype = fileData.mimetype;
          size = fileData.size;
          originalname = fileData.originalname;
          filename = fileData.filename;
          destination = fileData.destination;
          path = fileData.path;
        }

        const profile = await ProfileService.createProfile(
          userName,
          email,
          walletId,
          fieldname,
          originalname,
          encoding,
          mimetype,
          filename,
          destination,
          path,
          size
        );

        return res.status(201).json({
          status: true,
          data: profile,
          error: null,
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: err.message,
    });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const { walletId } = req.query;

    const profile = await ProfileService.getProfile(walletId);

    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/file/:id", async (req, res) => {
  try {
    const fileData = await ProfileService.getFile(req.params.id);
    res.setHeader("Content-Type", fileData.contentType);
    res.send(fileData.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
