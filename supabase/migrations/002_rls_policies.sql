-- ============================================================
-- LayerPro — Row-Level Security Policies
-- Migration 002: RLS
-- ============================================================

-- Enable RLS
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_user_roles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_houses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE flocks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE flock_population ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_grading      ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory   ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE morbidity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortality_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE culling_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_configs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: can user access farm?
-- ============================================================

CREATE OR REPLACE FUNCTION user_can_access_farm(p_farm_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM farms WHERE id = p_farm_id AND owner_id = auth.uid()
    UNION
    SELECT 1 FROM farm_user_roles WHERE farm_id = p_farm_id AND user_id = auth.uid()
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- FARMS
-- ============================================================

CREATE POLICY "Farm owners can manage farms"
  ON farms FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Farm members can view farms"
  ON farms FOR SELECT USING (user_can_access_farm(id));

-- ============================================================
-- FARM USER ROLES
-- ============================================================

CREATE POLICY "Farm owners manage roles"
  ON farm_user_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM farms WHERE id = farm_id AND owner_id = auth.uid())
  );

CREATE POLICY "Members can view their role"
  ON farm_user_roles FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- ALL FARM-SCOPED TABLES (generic policy macro)
-- For all tables with farm_id, users with farm access can SELECT/INSERT/UPDATE/DELETE
-- ============================================================

-- POULTRY HOUSES
CREATE POLICY "Farm access to houses"
  ON poultry_houses FOR ALL USING (user_can_access_farm(farm_id));

-- FLOCKS
CREATE POLICY "Farm access to flocks"
  ON flocks FOR ALL USING (user_can_access_farm(farm_id));

-- FLOCK POPULATION
CREATE POLICY "Farm access to flock population"
  ON flock_population FOR ALL USING (user_can_access_farm(farm_id));

-- DAILY PRODUCTION
CREATE POLICY "Farm access to daily production"
  ON daily_production FOR ALL USING (user_can_access_farm(farm_id));

-- EGG GRADING
CREATE POLICY "Farm access to egg grading"
  ON egg_grading FOR ALL USING (user_can_access_farm(farm_id));

-- FEED INVENTORY
CREATE POLICY "Farm access to feed inventory"
  ON feed_inventory FOR ALL USING (user_can_access_farm(farm_id));

-- FEED CONSUMPTION
CREATE POLICY "Farm access to feed consumption"
  ON feed_consumption FOR ALL USING (user_can_access_farm(farm_id));

-- WATER CONSUMPTION
CREATE POLICY "Farm access to water consumption"
  ON water_consumption FOR ALL USING (user_can_access_farm(farm_id));

-- HEALTH EVENTS
CREATE POLICY "Farm access to health events"
  ON health_events FOR ALL USING (user_can_access_farm(farm_id));

-- MORBIDITY RECORDS
CREATE POLICY "Farm access to morbidity records"
  ON morbidity_records FOR ALL USING (user_can_access_farm(farm_id));

-- MORTALITY RECORDS
CREATE POLICY "Farm access to mortality records"
  ON mortality_records FOR ALL USING (user_can_access_farm(farm_id));

-- VACCINATIONS
CREATE POLICY "Farm access to vaccinations"
  ON vaccinations FOR ALL USING (user_can_access_farm(farm_id));

-- MEDICATIONS
CREATE POLICY "Farm access to medications"
  ON medications FOR ALL USING (user_can_access_farm(farm_id));

-- CULLING RECORDS
CREATE POLICY "Farm access to culling records"
  ON culling_records FOR ALL USING (user_can_access_farm(farm_id));

-- EXPENSES
CREATE POLICY "Farm access to expenses"
  ON expenses FOR ALL USING (user_can_access_farm(farm_id));

-- SALES
CREATE POLICY "Farm access to sales"
  ON sales FOR ALL USING (user_can_access_farm(farm_id));

-- INVENTORY ITEMS
CREATE POLICY "Farm access to inventory items"
  ON inventory_items FOR ALL USING (user_can_access_farm(farm_id));

-- INVENTORY MOVEMENTS
CREATE POLICY "Farm access to inventory movements"
  ON inventory_movements FOR ALL USING (user_can_access_farm(farm_id));

-- ALERTS
CREATE POLICY "Farm access to alerts"
  ON alerts FOR ALL USING (user_can_access_farm(farm_id));

-- ALERT CONFIGS
CREATE POLICY "Farm access to alert configs"
  ON alert_configs FOR ALL USING (user_can_access_farm(farm_id));

-- AUDIT LOGS (read only for farm members)
CREATE POLICY "Farm access to audit logs"
  ON audit_logs FOR SELECT USING (user_can_access_farm(farm_id));
