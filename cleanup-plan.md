VX ACADEMY PROJECT - CLEANUP EXECUTION PLAN
===========================================

This plan provides a step-by-step approach to safely remove redundant files and improve the codebase.

## PHASE 1: PREPARATION & BACKUP
=================================

### Step 1: Create Backup
- Create a full project backup before starting cleanup
- Commit current state to git with message: "Pre-cleanup backup"
- Document current file count and sizes

### Step 2: Verify Project Status
- Ensure project builds successfully: `npm run build`
- Ensure development server runs: `npm run dev`
- Run any existing tests to confirm baseline functionality

### Step 3: Create Cleanup Branch
- Create new git branch: `git checkout -b cleanup/remove-redundant-files`
- This allows safe experimentation and easy rollback

## PHASE 2: SAFE REMOVALS (HIGH PRIORITY)
==========================================

### Step 4: Remove Unused Page Components
```bash
# Remove confirmed unused pages
rm client/src/pages/new-home-page.tsx
rm client/src/pages/course-detail.tsx
```

**Verification:**
- Check App.tsx imports are clean
- Ensure no other files reference these components
- Test build: `npm run build`

### Step 5: Clean Up Attached Assets - Screenshots
```bash
# Remove all screenshot files (development artifacts)
rm attached_assets/Screenshot*.png
```

**Verification:**
- Verify no code references these screenshots
- Check if any are needed for documentation

### Step 6: Remove Pasted Content Files
```bash
# Remove all pasted content files
rm attached_assets/Pasted-*.txt
```

**Verification:**
- These are temporary clipboard files, safe to remove
- Check file count reduction

### Step 7: Remove Timestamped Development Images
```bash
# Remove timestamped development images
rm attached_assets/image_*.png
```

**Verification:**
- Keep only images that are actively referenced in code
- Check public/images/ folder for actually used images

### Step 8: Test After Safe Removals
- Build project: `npm run build`
- Run development server: `npm run dev`
- Check key functionality works
- Commit changes: `git commit -m "Remove unused components and development artifacts"`

## PHASE 3: ROUTE CLEANUP (MEDIUM PRIORITY)
============================================

### Step 9: Remove Duplicate Admin Route
Edit `client/src/App.tsx`:
```typescript
// Remove this line:
<ProtectedRoute path="/admin/content-management" component={ContentManagement} />

// Keep this line:
<ProtectedRoute path="/admin/content" component={ContentManagement} />
```

**Verification:**
- Test admin navigation still works
- Check no components link to /admin/content-management
- Update any navigation components if needed

### Step 10: Test Route Changes
- Test admin functionality
- Verify all admin routes work correctly
- Commit: `git commit -m "Remove duplicate admin route"`

## PHASE 4: ASSET DEDUPLICATION (MEDIUM PRIORITY)
==================================================

### Step 11: Certificate Template Cleanup
Review and consolidate:
```bash
# Keep the most recent/actively used version
# Remove timestamped duplicates:
rm attached_assets/Certificate_Template_With_Placeholders_1750244699876.pdf
# Keep: Certificate_Template_With_Placeholders_1750244699874.pdf
```

**Verification:**
- Check server/routes.ts for hardcoded template paths
- Update any references to removed templates

### Step 12: Excel Template Cleanup
Review and consolidate:
```bash
# Keep one canonical version
# Remove timestamped duplicates:
rm attached_assets/VX_Academy_Import_Format_1750678855271.xlsx
rm attached_assets/VX_Academy_Import_Format_1750678855296.xlsx
# Keep: VX_Academy_Import_Format.xlsx
```

**Verification:**
- Check server/routes.ts for Excel template references
- Test Excel upload functionality

### Step 13: Test Asset Dependencies
- Test certificate generation functionality
- Test Excel upload functionality
- Verify no broken asset references
- Commit: `git commit -m "Consolidate duplicate asset files"`

## PHASE 5: CODE CONSOLIDATION (LOW PRIORITY)
==============================================

### Step 14: Review Certificate Handler Redundancy
**Analysis Required:**
- Review server/certificate-handler.ts
- Review server/certificate-pdf-service.ts
- Check duplicated logic in server/routes.ts

**Potential Actions:**
- Move certificate generation logic to certificate-pdf-service.ts
- Remove inline certificate code from routes.ts
- Consolidate upload handlers

### Step 15: Review Assessment Components
**Analysis Required:**
- Compare AssessmentFlow.tsx vs ComprehensiveAssessment.tsx
- Check if both are actively used
- Determine if consolidation is beneficial

### Step 16: Review Upload Handlers
**Analysis Required:**
- Check patterns in image-handler.ts, media-handler.ts, certificate-handler.ts
- Consider creating shared upload utility
- Consolidate similar multer configurations

## PHASE 6: VERIFICATION & CLEANUP
===================================

### Step 17: Final Testing
- Full build test: `npm run build`
- Development server test: `npm run dev`
- Test all major functionality:
  - User authentication
  - Course access
  - Assessment completion
  - Admin functions
  - File uploads
  - Certificate generation

### Step 18: Performance Check
- Check file count reduction
- Verify build time improvements
- Check bundle size if applicable

### Step 19: Documentation Update
- Update PROJECT_BREAKDOWN.md if needed
- Document any architectural changes
- Update any references to removed files

### Step 20: Final Commit and Merge
- Final commit: `git commit -m "Complete redundant file cleanup"`
- Merge to main: `git checkout main && git merge cleanup/remove-redundant-files`
- Delete cleanup branch: `git branch -d cleanup/remove-redundant-files`

## ROLLBACK PLAN
================

If issues arise at any step:

### Emergency Rollback
```bash
# If on cleanup branch
git checkout main
git branch -D cleanup/remove-redundant-files

# If changes were merged
git revert [commit-hash]
```

### Partial Rollback
```bash
# Restore specific files
git checkout HEAD~1 -- path/to/file

# Or restore from backup
cp backup/path/to/file current/path/to/file
```

## EXPECTED OUTCOMES
====================

### File Reduction:
- Remove ~95+ redundant files
- Reduce attached_assets folder size by 50-100MB
- Clean up 2 unused page components
- Remove 1 duplicate route

### Code Quality:
- Cleaner App.tsx routing
- Reduced confusion from duplicate files
- Better organized asset structure
- Improved maintainability

### Risks Mitigated:
- Git branch strategy prevents main branch corruption
- Step-by-step approach allows early detection of issues
- Backup ensures complete recovery option
- Testing at each phase prevents accumulation of problems

## MAINTENANCE NOTES
====================

### Prevent Future Accumulation:
- Regular cleanup of attached_assets folder
- Clear naming conventions for assets
- Remove development artifacts before commits
- Use .gitignore for temporary files

### Monitoring:
- Watch for new unused components
- Monitor duplicate file creation
- Regular code reviews for redundancy
- Automated tools for dead code detection

## ESTIMATED TIME
=================

- Phase 1 (Preparation): 30 minutes
- Phase 2 (Safe Removals): 1 hour
- Phase 3 (Route Cleanup): 30 minutes
- Phase 4 (Asset Deduplication): 1 hour
- Phase 5 (Code Consolidation): 2-4 hours (optional)
- Phase 6 (Verification): 1 hour

**Total Time: 6-8 hours** (can be done in stages)

## SUCCESS CRITERIA
===================

1. ✅ Project builds successfully
2. ✅ All functionality works as before
3. ✅ File count reduced by ~95+ files
4. ✅ No broken references or imports
5. ✅ Asset folder size reduced significantly
6. ✅ Code is cleaner and more maintainable
7. ✅ Documentation is updated
8. ✅ Changes are properly versioned in git