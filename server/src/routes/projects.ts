import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

// Add media upload routes
router.post(
  '/:projectId/team-members/:index/media',
  auth,
  upload.single('media'),
  uploadTeamMemberMedia
);

router.post(
  '/:projectId/collaborators/:index/media',
  auth,
  upload.single('media'),
  uploadCollaboratorMedia
);

router.post(
  '/:projectId/advisors/:index/media',
  auth,
  upload.single('media'),
  uploadAdvisorMedia
);

router.post(
  '/:projectId/partners/:index/media',
  auth,
  upload.single('media'),
  uploadPartnerMedia
);

router.post(
  '/:projectId/testimonials/:index/media',
  auth,
  upload.single('media'),
  uploadTestimonialMedia
); 