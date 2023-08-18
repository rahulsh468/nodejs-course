const PageContentDAO = require("../dao/PageContentDAO");
const cloudinary  = require('../configs/cloudinary')
exports.createUpdatePageContent = async (details) => {
  try {
    const pageContent = await PageContentDAO.createUpdatePageContent(details);
    return pageContent;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};


exports.uploadImage = async(pageName,
  fieldname,
  originalname,
  encoding,
  mimetype,
  filename,
  destination,
  path,
  size) => {
try{

  const imageData = {
    pageName
  }

  if (path) {
    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(path, {
      folder: 'admins', // Optional: Set the folder where the image will be stored
      resource_type: 'auto'
    });
    imageData.cloudinaryUrl = result.secure_url;
    imageData.cloudinaryPublicId = result.public_id;
  }

  const pageContent = await PageContentDAO.uploadImageDAO(imageData);
  return pageContent;

} catch (error) {
  return { Success: false, Error: error.message };
}
}

exports.findPageContent = async (pageName) => {
  try {
    const pageContent = await PageContentDAO.findPageContent(pageName);
    return pageContent;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getAllPages = async () => {
  try {
    const pageContent = await PageContentDAO.getAllPages();
    return pageContent;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getAllFAQ = async () => {
  try {
    const faqContent = await PageContentDAO.getAllFAQ();
    return faqContent;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
exports.createFAQ = async (faqDetails) => {
  try {
    const newFAQ = await PageContentDAO.newFAQ(faqDetails);
    return newFAQ;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
