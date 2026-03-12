import { Router } from 'express';
import { praticaController } from '../controllers/pratica.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPraticaSchema, updatePraticaSchema, createNoteSchema, generateArtifactSchema } from '../validators/pratica.validators.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// Pratiche CRUD
router.get('/', praticaController.list);
router.post('/', validate(createPraticaSchema, 'body'), praticaController.create);
router.get('/:id', praticaController.getById);
router.patch('/:id', validate(updatePraticaSchema, 'body'), praticaController.update);
router.delete('/:id', praticaController.remove);

// Notes
router.get('/:id/notes', praticaController.getNotes);
router.post('/:id/notes', validate(createNoteSchema, 'body'), praticaController.addNote);
router.delete('/:id/notes/:noteId', praticaController.removeNote);

// Artifacts
router.get('/:id/artifacts', praticaController.getArtifacts);
router.post('/:id/artifacts/generate', validate(generateArtifactSchema, 'body'), praticaController.generateArtifact);
router.patch('/artifacts/:artifactId', praticaController.updateArtifact);
router.delete('/artifacts/:artifactId', praticaController.removeArtifact);

export default router;
