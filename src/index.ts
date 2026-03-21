import express from 'express';

import serverConfig from './config/server.config';
import v1Router from './routers/v1';

const app=express();

app.use(express.json());
app.use('/',v1Router);

app.listen(serverConfig.PORT,()=>{
    console.log(`Server started at PORT: ${serverConfig.PORT}`);
});