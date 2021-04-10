/*express */
const express = require('express');
const router = express.Router();
const app = express();

const loggd = require("loggd");
const usersdb = new loggd("/database/users.json");

/*router defs*/

router.get('/', async (req,res) => {
    
});

app.use('/', router);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Node server running on ${process.env.PORT || 3000}`);
});