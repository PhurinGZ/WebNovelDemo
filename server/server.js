const express = require('express');
const novelRoute = require('./Routes/novelRoute');

const userRouter = require('./Routes/userRoute');


const app = express();

app.use(userRouter);
app.use(novelRoute);

// Start server
app.listen(3001, () => {
    console.log("Server running on port 3001");
  });
