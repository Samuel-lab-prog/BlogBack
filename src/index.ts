import app from './app';
import AppError from './utils/AppError';

app.listen(
    process.env.PORT ? Number(process.env.PORT) : 3000,
    () => {
        
        console.log(`🦊 Servidor rodando em http://localhost:${process.env.PORT ? Number(process.env.PORT) : 3000}`);
    }
);