const PageContentModel = require("../models/PageContentModel");
const FAQModel = require("../models/FAQModel");
exports.createUpdatePageContent = async (details) => {
  try {
    const pageContent = await PageContentModel.findOneAndUpdate(
      {
        pageName: details.pageName,
      },
      {
        $set: details,
      },
      {
        new: true,
        upsert: true,
      }
    );
    return { Success: true, Data: pageContent };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.uploadImageDAO = async (details) => {
  try {
    const pageContent = await PageContentModel.findOneAndUpdate(
      {
        pageName: details.pageName,
      },
      {
        cloudinaryUrl: details.cloudinaryUrl,
        cloudinaryPublicId: details.cloudinaryPublicId,
      },
      {
        new: true,
        upsert: true,
      }
    );
    return { Success: true, Data: pageContent };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.findPageContent = async (pageName) => {
  try {
    const pageContent = await PageContentModel.findOne({
      pageName: pageName,
    });
    return { Success: true, Data: pageContent };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getAllPages = async () => {
  try {
    const pageContent = await PageContentModel.find({});
    return { Success: true, Data: pageContent };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getAllFAQ = async () => {
  try {
    const faqs = await FAQModel.find({});
    return { Success: true, Data: faqs };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.newFAQ = async (faqDetails) => {
  try {
    const faqs = faqDetails.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }));
    console.log(faqs);
    const newFAQ = await FAQModel.findOneAndUpdate(
      {
        userName: "admin",
      },
      {
        faqs: faqs,
      },
      {
        new: true,
        upsert: true,
      }
    );
    return { Success: true, Data: newFAQ };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
