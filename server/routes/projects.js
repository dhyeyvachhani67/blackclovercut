import express from 'express';
import { projectsStore } from './analyze.js';
import { SAMPLE_VIDEOS } from '../services/samplesService.js';

const router = express.Router();

/**
 * GET /api/projects
 * List all projects and available sample templates
 */
router.get('/', (req, res) => {
  const userProjects = Array.from(projectsStore.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json({
    success: true,
    projects: userProjects,
    samples: SAMPLE_VIDEOS
  });
});

/**
 * GET /api/projects/:id
 * Get single project with all clips
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const project = projectsStore.get(id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  res.json({
    success: true,
    project
  });
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  projectsStore.delete(id);
  res.json({ success: true, message: 'Project removed.' });
});

export default router;
