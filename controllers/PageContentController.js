const PageContentService = require("../services/PageContentService");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middlewares/verifyUser");
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

router.post("/", auth.verifyAdmin, async (req, res) => {
  try {
    const data = await PageContentService.createUpdatePageContent(req.body);
    if (!data.Success) throw new Error("Something went wrong!");
    else {
      return res.status(200).json({
        status: true,
        data: data.Data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});

router.post("/image", auth.verifyAdmin, async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ Error: err.message });
      } else if (err) {
        return res.status(500).json({ Error: err.message });
      } else {
        const {pageName} = req.body;
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

        const data = await PageContentService.uploadImage(
          pageName,
          fieldname,
          originalname,
          encoding,
          mimetype,
          filename,
          destination,
          path,
          size
        );
        if (!data.Success) throw new Error("Something went wrong!");
        else {
          return res.status(200).json({
            status: true,
            data: data.Data,
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});

router.get("/allFAQ", async (req, res) => {
  try {
    const data = await PageContentService.getAllFAQ();
    if (!data.Success) throw new Error("Something went wrong!");
    else {
      return res.status(200).json({
        status: true,
        data: data.Data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});
router.post("/createFAQ", async (req, res) => {
  try {
    const data = await PageContentService.createFAQ(req.body);
    if (!data.Success) throw new Error("Something went wrong!");
    else {
      return res.status(200).json({
        status: true,
        data: data.Data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});
router.post("/updateFAQ", async (req, res) => {
  try {
    const data = await PageContentService.updateFAQ(req.body);
    if (!data.Success) throw new Error("Something went wrong!");
    else {
      return res.status(200).json({
        status: true,
        data: data.Data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});
router.post("/deleteFAQ", async (req, res) => {
  try {
    const data = await PageContentService.deleteFAQ(req.body);
    if (!data.Success) throw new Error("Something went wrong!");
    else {
      return res.status(200).json({
        status: true,
        data: data.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});

router.post("/getPage", async (req, res) => {
  try {
    const { pageName } = req.body;
    const data = await PageContentService.findPageContent(pageName);
    if (!data.Success) throw new Error("Something went wrong!");
    else {
      return res.status(200).json({
        status: true,
        data: data.Data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});

router.get("/", auth.verifyAdmin, async (req, res) => {
  try {
    const data = await PageContentService.getAllPages();
    if (!data.Success) throw new Error("Something went wrong!");
    else {
      return res.status(200).json({
        status: true,
        data: data.Data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});

module.exports = router;
