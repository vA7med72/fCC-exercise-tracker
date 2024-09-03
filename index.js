const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

const usersObjs = [{'username': 'vA7med', '_id': 1, 'log': []}]

app.route('/api/users')
.get((req, res) => {
  let returnObj = usersObjs.map(n => {
    return { '_id': String(n._id), 'username': n.username}
  })
  res.json(returnObj)
})
.post((req, res) => {
  const randomId = Math.floor(Math.random() * 42190218471232178);
  let userObj = {'username': req.body.username, '_id': randomId, 'log': []}
  res.json(userObj);
  usersObjs.push(userObj);
})

app.post('/api/users/:_id/exercises', (req, res) => {
  
  let userObj = usersObjs.find(o => o._id == req.params._id);
  if(!userObj) return res.json({"error": 'invalid user ID'});
  let exeObj = {
    '_id': userObj._id,
    'username': userObj.username
  }
  let date = !req.body.date 
  ? new Date(Date.now()).toDateString() : req.body.date.includes('-')
  ? new Date(req.body.date).toDateString() : new Date(Number(req.body.date)).toDateString();

  if(!req.body.description || !req.body.duration || isNaN(Number(req.body.duration))) return res.json({'error': 'invalid exercise info'});
  exeObj.date = date;
  exeObj.duration = Number(req.body.duration)
  exeObj.description = req.body.description
  res.json(exeObj)
  let i = usersObjs.indexOf(userObj);
  usersObjs[i].log.push({
    'date': date, 
    'duration': req.body.duration,
    'description': req.body.description 
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  let userObj = usersObjs.find(o => o._id == req.params._id);
  if(!userObj) return res.json({"error": 'invalid user ID'});
  let logs = userObj.log;
  let returnObj = {
    '_id': userObj._id,
    'username': userObj.username
  }
  if(req.query.from) {
    let from = req.query.from
    if(new Date(from) == 'Invalid Date' && new Date(Number(from))  == 'Invalid Date') logs = logs;
    else {
      from = from.includes('-') ?
      new Date(from).getTime() : new Date(Number(from)).getTime();
      returnObj.from = new Date(from).toDateString();
      logs = logs.filter(n => new Date(n.date).getTime() > from);
    }
  }
  if(req.query.to) {
    let to = req.query.to
    if(new Date(to) == 'Invalid Date' && new Date(Number(to))  == 'Invalid Date') logs = logs;
    else {
      to =  to.includes('-') ?
      new Date(to).getTime() : new Date(Number(to)).getTime();
      returnObj.to = new Date(to).toDateString();
      logs = logs.filter(n => new Date(n.date).getTime() < to);
    }
  }
  let count = logs.length
  if(req.query.limit){
    count = Number(req.query.limit)
    if(isNaN(count)) count = logs.length;
    else {
      logs = logs.slice(0, count)
    }
  }
  returnObj.count = count;
    returnObj.log = logs.map(n => {
        return {
          'date': n.date,
          'duration': Number(n.duration),
          'description': n.description
        }
      }
    )
  res.json(returnObj)
})

const listener = app.listen(3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
