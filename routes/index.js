const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    const userId = req.user.id;
    knex("tasks")
      .select("*")
      .where({user_id: userId})
      .then(function (results) {
        res.render('index', {
          title: 'ToDo App',
          todos: results,
          isAuth: isAuth,
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'ToDo App',
          isAuth: isAuth,
          errorMessage: [err.sqlMessage],
        });
      });
  } else {
    res.render('index', {
      title: 'ToDo App',
      isAuth: isAuth,
    });
  }
});

router.post('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const userId = req.user.id;
  const todo = req.body.add;
  knex("tasks")
    .insert({user_id: userId, content: todo})
    .then(function () {
      res.redirect('/')
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'ToDo App',
        isAuth: isAuth,
        errorMessage: [err.sqlMessage],
      });
    });
});

router.post('/delete', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const taskId = req.body.id;
  if (isAuth) {
    knex("tasks")
      .where({ id: taskId })
      .del()
      .then(function () {
        res.redirect('/');
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'ToDo App',
          isAuth: isAuth,
          errorMessage: [err.sqlMessage],
        });
      });
  } else {
    res.redirect('/');
  }
});

router.post('/delete-selected', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const taskIds = req.body.ids;
  if (isAuth && taskIds && taskIds.length > 0) {
    knex("tasks")
      .whereIn('id', taskIds)
      .del()
      .then(function () {
        res.sendStatus(200);
      })
      .catch(function (err) {
        console.error(err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(400);
  }
});


router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;
