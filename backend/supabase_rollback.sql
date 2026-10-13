-- ====================================================================
-- NOVA GRID: Safe Supabase Rollback Script
-- Removes only objects created by the Nova Grid migration using RESTRICT
-- ====================================================================

-- 1. Drop RLS Policies
DROP POLICY IF EXISTS "anon_detections_insert_select" ON public.detections;
DROP POLICY IF EXISTS "anon_inspections_insert_select" ON public.inspections;
DROP POLICY IF EXISTS "service_role_detections_all" ON public.detections;
DROP POLICY IF EXISTS "service_role_inspections_all" ON public.inspections;
DROP POLICY IF EXISTS "fault_classes_write_service" ON public.fault_classes;
DROP POLICY IF EXISTS "fault_classes_read_all" ON public.fault_classes;

-- 2. Drop Indexes
DROP INDEX IF EXISTS public.ix_detections_fault_class_id;
DROP INDEX IF EXISTS public.ix_detections_class_name;
DROP INDEX IF EXISTS public.ix_detections_inspection_id;
DROP INDEX IF EXISTS public.ix_inspections_mode;
DROP INDEX IF EXISTS public.ix_inspections_review_status;
DROP INDEX IF EXISTS public.ix_inspections_created_at;
DROP INDEX IF EXISTS public.ix_inspections_tower_id;
DROP INDEX IF EXISTS public.ix_fault_classes_code;

-- 3. Drop Tables safely using RESTRICT (protects pre-existing dependencies)
DROP TABLE IF EXISTS public.detections RESTRICT;
DROP TABLE IF EXISTS public.inspections RESTRICT;
DROP TABLE IF EXISTS public.fault_classes RESTRICT;
