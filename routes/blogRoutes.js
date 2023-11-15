const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    // BEFORE
    // const redis = require('redis');
    // const redisURl = 'redis://127.0.0.1:6379';
    // const client = redis.createClient(redisURl);
    // const util = require('util');
    // // all the client.get are now promisified
    // client.get = util.promisify(client.get);
    // // Do we have any cached data in redis 
    // // related to this query

    // // original
    // // // // const cachedBlogs = client.get(req.user.id , () => {});
    // // with promisify
    // // // // since this is promisified we can now use async/await
    // const cachedBlogs = await client.get(req.user.id);

    // // if yes return that data right away
    // if (cachedBlogs) {
    //   console.log('Serving from cache');
    //   return res.send(JSON.parse(cachedBlogs));
    // }

    // // if no the send mongodb query and cache the response
    // console.log('Serving from mongodb');
    // const blogs = await Blog.find({ _user: req.user.id });
    // res.send(blogs);
    // client.set(req.user.id, JSON.stringify(blogs));


    // AFTER
    const blogs = await Blog.find({ _user: req.user.id });
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
