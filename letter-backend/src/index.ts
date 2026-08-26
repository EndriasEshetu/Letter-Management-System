import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import departmentsRoutes from './routes/departments.routes';
import documentsRoutes from './routes/documents.routes';
import approvalsRoutes from './routes/approvals.routes';
import commentsRoutes from './routes/comments.routes';
import notificationsRoutes from './routes/notifications.routes';

const app = express();

app.use(
  cors({
    origin: config.corsOrigin.includes('*') ? true : config.corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.options('*', cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (useful for direct link previews in the frontend).
app.use('/uploads', express.static(path.resolve(config.uploadsDir)));

// Health check (unauthenticated).
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'letter-management-backend', time: new Date().toISOString() });
});

app.get('/api/health/letters', (_req, res) => {
  res.json({ status: 'ok', service: 'letter-management-letter-service', time: new Date().toISOString() });
});

// All routes are served under /api to match the frontend's base URL.
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/letters', documentsRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/documents', commentsRoutes); // comments live under /api/documents/:id/comments
app.use('/api/letters', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] Letter Management API listening on http://localhost:${config.port}/api`);
  console.log(`[server] Environment: ${config.nodeEnv}`);
  console.log(`[server] Uploads directory: ${config.uploadsDir}`);
});

export default app;
