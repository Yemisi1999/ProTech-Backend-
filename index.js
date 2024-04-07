import express from 'express';
import DBConfig from './db/connect.js';
// import connectDB from './db/connect';
import route from './routes/userRoute.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';



const app = express();

app.use([
    cors(),
    cookieParser(),
    express.json(),
    express.urlencoded({ extended: true }),
  ]);


app.use('/api/v1/users', route);

// app.use(notFound)

// app.use(errorHandlerMiddleware)


const port = process.env.PORT || 5002;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

