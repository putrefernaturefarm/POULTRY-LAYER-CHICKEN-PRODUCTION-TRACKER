-- ============================================================
-- LayerPro — Poultry Layer Chicken Production Tracker
-- Migration 001: Core Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('owner','farm_manager','staff','technician','viewer');
CREATE TYPE flock_status AS ENUM ('active','completed','culled','sold','transferred');
CREATE TYPE housing_type AS ENUM ('cage','floor','free_range','battery_cage','enriched_cage');
CREATE TYPE health_outcome AS ENUM ('recovered','under_treatment','culled','died','referred','monitoring');
CREATE TYPE culling_reason AS ENUM ('poor_production','disease','injury','old_age','excess_males','other');
CREATE TYPE disposal_method AS ENUM ('sold','buried','composted','incinerated','other');
CREATE TYPE vaccination_route AS ENUM ('drinking_water','spray','eye_drop','wing_web','subcutaneous','intramuscular','oral','intranasal');
CREATE TYPE medication_route AS ENUM ('drinking_water','feed','injection','topical','oral','eye_drop');
CREATE TYPE inventory_action AS ENUM ('purchase','usage','adjustment','transfer','expired','damaged','return','opening');
CREATE TYPE expense_category AS ENUM ('feed','vaccines','medication','labor','electricity','water','transportation','repairs','equipment','packaging','veterinary','chicks','bedding','other');
CREATE TYPE sale_type AS ENUM ('eggs','live_birds','spent_hens','culls','manure','other');
CREATE TYPE egg_grade AS ENUM ('jumbo','extra_large','large','medium','small','peewee','cracked','dirty','rejected');
CREATE TYPE alert_type AS ENUM ('high_morbidity','high_mortality','low_feed','low_vaccine','low_medicine','production_drop','abnormal_feed','medication_withdrawal','vaccination_due','other');
CREATE TYPE alert_severity AS ENUM ('info','warning','critical');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT,
  phone          TEXT,
  avatar_url     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FARMS
-- ============================================================

CREATE TABLE farms (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  address        TEXT,
  municipality   TEXT,
  province       TEXT,
  region         TEXT,
  contact_person TEXT,
  contact_phone  TEXT,
  contact_email  TEXT,
  farm_type      TEXT DEFAULT 'Layer',
  license_no     TEXT,
  logo_url       TEXT,
  notes          TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER-FARM ROLES
-- ============================================================

CREATE TABLE farm_user_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id    UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       user_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(farm_id, user_id)
);

-- ============================================================
-- POULTRY HOUSES
-- ============================================================

CREATE TABLE poultry_houses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id      UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  code         TEXT,
  housing_type housing_type,
  capacity     INT,
  length_m     NUMERIC(10,2),
  width_m      NUMERIC(10,2),
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FLOCKS
-- ============================================================

CREATE TABLE flocks (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id               UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  house_id              UUID REFERENCES poultry_houses(id),
  flock_code            TEXT NOT NULL,
  batch_number          TEXT,
  breed_strain          TEXT,
  source                TEXT,
  date_received         DATE NOT NULL,
  initial_population    INT NOT NULL DEFAULT 0,
  initial_males         INT NOT NULL DEFAULT 0,
  initial_females       INT NOT NULL DEFAULT 0,
  production_start_date DATE,
  expected_end_date     DATE,
  status                flock_status NOT NULL DEFAULT 'active',
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FLOCK POPULATION (daily snapshot)
-- ============================================================

CREATE TABLE flock_population (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flock_id           UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  farm_id            UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  record_date        DATE NOT NULL,
  beginning_pop      INT NOT NULL DEFAULT 0,
  additions          INT NOT NULL DEFAULT 0,
  mortality          INT NOT NULL DEFAULT 0,
  culling            INT NOT NULL DEFAULT 0,
  sold_transferred   INT NOT NULL DEFAULT 0,
  ending_pop         INT GENERATED ALWAYS AS (beginning_pop + additions - mortality - culling - sold_transferred) STORED,
  notes              TEXT,
  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(flock_id, record_date),
  CONSTRAINT no_negative_pop CHECK (beginning_pop + additions - mortality - culling - sold_transferred >= 0),
  CONSTRAINT no_negative_fields CHECK (
    beginning_pop >= 0 AND additions >= 0 AND mortality >= 0 AND culling >= 0 AND sold_transferred >= 0
  )
);

-- ============================================================
-- DAILY EGG PRODUCTION
-- ============================================================

CREATE TABLE daily_production (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flock_id          UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  house_id          UUID REFERENCES poultry_houses(id),
  record_date       DATE NOT NULL,
  hens_present      INT NOT NULL DEFAULT 0,
  total_eggs        INT NOT NULL DEFAULT 0,
  good_eggs         INT NOT NULL DEFAULT 0,
  cracked_eggs      INT NOT NULL DEFAULT 0,
  dirty_eggs        INT NOT NULL DEFAULT 0,
  broken_eggs       INT NOT NULL DEFAULT 0,
  rejected_eggs     INT NOT NULL DEFAULT 0,
  other_losses      INT NOT NULL DEFAULT 0,
  -- Computed fields stored for performance
  eggs_per_hen      NUMERIC(8,4) GENERATED ALWAYS AS (
    CASE WHEN hens_present > 0 THEN total_eggs::NUMERIC / hens_present ELSE 0 END
  ) STORED,
  hen_day_pct       NUMERIC(8,4) GENERATED ALWAYS AS (
    CASE WHEN hens_present > 0 THEN (total_eggs::NUMERIC / hens_present) * 100 ELSE 0 END
  ) STORED,
  egg_loss_pct      NUMERIC(8,4) GENERATED ALWAYS AS (
    CASE WHEN total_eggs > 0 THEN ((total_eggs - good_eggs)::NUMERIC / total_eggs) * 100 ELSE 0 END
  ) STORED,
  good_egg_pct      NUMERIC(8,4) GENERATED ALWAYS AS (
    CASE WHEN total_eggs > 0 THEN (good_eggs::NUMERIC / total_eggs) * 100 ELSE 0 END
  ) STORED,
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(flock_id, record_date),
  CONSTRAINT valid_egg_counts CHECK (
    total_eggs >= 0 AND good_eggs >= 0 AND cracked_eggs >= 0 AND
    dirty_eggs >= 0 AND broken_eggs >= 0 AND rejected_eggs >= 0 AND
    hens_present >= 0
  ),
  CONSTRAINT good_eggs_not_exceed_total CHECK (
    good_eggs <= total_eggs
  )
);

-- ============================================================
-- EGG GRADING RECORDS
-- ============================================================

CREATE TABLE egg_grading (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_id UUID REFERENCES daily_production(id) ON DELETE CASCADE,
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id      UUID REFERENCES flocks(id),
  record_date   DATE NOT NULL,
  grade         egg_grade NOT NULL,
  quantity      INT NOT NULL DEFAULT 0,
  unit_price    NUMERIC(12,4) DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_grading CHECK (quantity >= 0 AND unit_price >= 0)
);

-- ============================================================
-- FEED INVENTORY
-- ============================================================

CREATE TABLE feed_inventory (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id        UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  feed_type      TEXT NOT NULL,
  brand          TEXT,
  supplier       TEXT,
  unit           TEXT NOT NULL DEFAULT 'kg',
  current_stock  NUMERIC(14,4) NOT NULL DEFAULT 0,
  reorder_level  NUMERIC(14,4) DEFAULT 0,
  unit_cost      NUMERIC(12,4) DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_negative_stock CHECK (current_stock >= 0)
);

-- ============================================================
-- FEED CONSUMPTION (daily)
-- ============================================================

CREATE TABLE feed_consumption (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flock_id       UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  farm_id        UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  feed_id        UUID REFERENCES feed_inventory(id),
  record_date    DATE NOT NULL,
  hens_present   INT NOT NULL DEFAULT 0,
  amount_kg      NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit_cost      NUMERIC(12,4) DEFAULT 0,
  total_cost     NUMERIC(14,4) GENERATED ALWAYS AS (amount_kg * unit_cost) STORED,
  feed_per_hen_g NUMERIC(10,4) GENERATED ALWAYS AS (
    CASE WHEN hens_present > 0 THEN (amount_kg * 1000) / hens_present ELSE 0 END
  ) STORED,
  notes          TEXT,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_feed CHECK (amount_kg >= 0 AND hens_present >= 0)
);

-- ============================================================
-- WATER CONSUMPTION (daily)
-- ============================================================

CREATE TABLE water_consumption (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flock_id        UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  record_date     DATE NOT NULL,
  hens_present    INT NOT NULL DEFAULT 0,
  amount_liters   NUMERIC(14,4) NOT NULL DEFAULT 0,
  water_source    TEXT,
  treatment_used  TEXT,
  medication_used TEXT,
  water_per_bird  NUMERIC(10,4) GENERATED ALWAYS AS (
    CASE WHEN hens_present > 0 THEN amount_liters / hens_present ELSE 0 END
  ) STORED,
  is_abnormal     BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_water CHECK (amount_liters >= 0 AND hens_present >= 0)
);

-- ============================================================
-- HEALTH EVENTS
-- ============================================================

CREATE TABLE health_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flock_id          UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  house_id          UUID REFERENCES poultry_houses(id),
  event_date        DATE NOT NULL,
  condition_name    TEXT NOT NULL,
  clinical_signs    TEXT,
  affected_count    INT NOT NULL DEFAULT 0,
  outcome           health_outcome DEFAULT 'monitoring',
  treatment         TEXT,
  veterinarian      TEXT,
  responsible       TEXT,
  is_resolved       BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_date     DATE,
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_affected CHECK (affected_count >= 0)
);

-- ============================================================
-- MORBIDITY RECORDS (DEDICATED — separate from mortality)
-- ============================================================

CREATE TABLE morbidity_records (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id               UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id              UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  house_id              UUID REFERENCES poultry_houses(id),
  health_event_id       UUID REFERENCES health_events(id),
  record_date           DATE NOT NULL,
  flock_age_weeks       INT,
  population_at_risk    INT NOT NULL DEFAULT 0,
  condition_disease     TEXT NOT NULL,
  clinical_signs        TEXT,
  num_affected          INT NOT NULL DEFAULT 0,
  num_recovered         INT NOT NULL DEFAULT 0,
  num_under_treatment   INT NOT NULL DEFAULT 0,
  num_referred          INT NOT NULL DEFAULT 0,
  num_culled            INT NOT NULL DEFAULT 0,
  num_subsequently_died INT NOT NULL DEFAULT 0,
  treatment_intervention TEXT,
  medication_used       TEXT,
  vaccination_history   TEXT,
  veterinarian          TEXT,
  responsible_person    TEXT,
  duration_days         INT,
  outcome               health_outcome DEFAULT 'monitoring',
  is_resolved           BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_date         DATE,
  -- Morbidity rate: affected / population_at_risk * 100
  morbidity_rate        NUMERIC(8,4) GENERATED ALWAYS AS (
    CASE WHEN population_at_risk > 0
      THEN (num_affected::NUMERIC / population_at_risk) * 100
      ELSE 0 END
  ) STORED,
  notes                 TEXT,
  created_by            UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_morbidity_counts CHECK (
    num_affected >= 0 AND num_recovered >= 0 AND num_under_treatment >= 0 AND
    num_referred >= 0 AND num_culled >= 0 AND num_subsequently_died >= 0 AND
    population_at_risk >= 0
  ),
  CONSTRAINT morbidity_not_exceed_pop CHECK (num_affected <= population_at_risk)
);

-- ============================================================
-- MORTALITY RECORDS (DEDICATED — separate from morbidity)
-- ============================================================

CREATE TABLE mortality_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id          UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  house_id          UUID REFERENCES poultry_houses(id),
  morbidity_id      UUID REFERENCES morbidity_records(id),
  record_date       DATE NOT NULL,
  flock_age_weeks   INT,
  population_at_risk INT NOT NULL DEFAULT 0,
  num_deaths        INT NOT NULL DEFAULT 0,
  suspected_cause   TEXT,
  diagnostic_info   TEXT,
  disposal_method   disposal_method,
  -- Mortality rate: deaths / population_at_risk * 100
  mortality_rate    NUMERIC(8,4) GENERATED ALWAYS AS (
    CASE WHEN population_at_risk > 0
      THEN (num_deaths::NUMERIC / population_at_risk) * 100
      ELSE 0 END
  ) STORED,
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_mortality CHECK (
    num_deaths >= 0 AND population_at_risk >= 0
  ),
  CONSTRAINT deaths_not_exceed_pop CHECK (num_deaths <= population_at_risk)
);

-- ============================================================
-- VACCINATIONS
-- ============================================================

CREATE TABLE vaccinations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id             UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id            UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  house_id            UUID REFERENCES poultry_houses(id),
  vaccine_name        TEXT NOT NULL,
  disease_target      TEXT,
  date_administered   DATE NOT NULL,
  flock_age_weeks     INT,
  dose                TEXT,
  route               vaccination_route,
  num_vaccinated      INT NOT NULL DEFAULT 0,
  supplier            TEXT,
  batch_lot_number    TEXT,
  expiration_date     DATE,
  responsible_person  TEXT,
  next_vaccination    DATE,
  cost                NUMERIC(12,4) DEFAULT 0,
  notes               TEXT,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDICATIONS / TREATMENTS
-- ============================================================

CREATE TABLE medications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id          UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  morbidity_id      UUID REFERENCES morbidity_records(id),
  medication_name   TEXT NOT NULL,
  purpose           TEXT,
  condition_treated TEXT,
  date_started      DATE NOT NULL,
  date_completed    DATE,
  dosage            TEXT,
  route             medication_route,
  num_birds_treated INT NOT NULL DEFAULT 0,
  responsible       TEXT,
  cost              NUMERIC(12,4) DEFAULT 0,
  withdrawal_period_days INT DEFAULT 0,
  withdrawal_end_date    DATE,
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CULLING RECORDS
-- ============================================================

CREATE TABLE culling_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id        UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  morbidity_id    UUID REFERENCES morbidity_records(id),
  record_date     DATE NOT NULL,
  flock_age_weeks INT,
  num_culled      INT NOT NULL DEFAULT 0,
  reason          culling_reason,
  condition       TEXT,
  destination     TEXT,
  revenue         NUMERIC(12,4) DEFAULT 0,
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_culling CHECK (num_culled >= 0)
);

-- ============================================================
-- EXPENSES
-- ============================================================

CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id     UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id    UUID REFERENCES flocks(id),
  expense_date DATE NOT NULL,
  category    expense_category NOT NULL,
  description TEXT,
  amount      NUMERIC(14,4) NOT NULL DEFAULT 0,
  supplier    TEXT,
  receipt_no  TEXT,
  notes       TEXT,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_expense CHECK (amount >= 0)
);

-- ============================================================
-- SALES
-- ============================================================

CREATE TABLE sales (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id      UUID REFERENCES flocks(id),
  sale_date     DATE NOT NULL,
  sale_type     sale_type NOT NULL,
  customer_name TEXT,
  customer_contact TEXT,
  quantity      NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit          TEXT,
  unit_price    NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_amount  NUMERIC(14,4) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  egg_grade     egg_grade,
  description   TEXT,
  receipt_no    TEXT,
  notes         TEXT,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_sale CHECK (quantity >= 0 AND unit_price >= 0)
);

-- ============================================================
-- GENERAL INVENTORY (supplies, medicines, etc.)
-- ============================================================

CREATE TABLE inventory_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  item_name       TEXT NOT NULL,
  unit            TEXT NOT NULL DEFAULT 'pcs',
  current_stock   NUMERIC(14,4) NOT NULL DEFAULT 0,
  reorder_level   NUMERIC(14,4) DEFAULT 0,
  unit_cost       NUMERIC(12,4) DEFAULT 0,
  expiry_date     DATE,
  supplier        TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_negative_inventory CHECK (current_stock >= 0)
);

CREATE TABLE inventory_movements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  item_id       UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  action        inventory_action NOT NULL,
  quantity      NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit_cost     NUMERIC(12,4) DEFAULT 0,
  reference_no  TEXT,
  notes         TEXT,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALERTS
-- ============================================================

CREATE TABLE alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id      UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id     UUID REFERENCES flocks(id),
  alert_type   alert_type NOT NULL,
  severity     alert_severity NOT NULL DEFAULT 'info',
  title        TEXT NOT NULL,
  message      TEXT,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  is_resolved  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALERT CONFIGURATIONS
-- ============================================================

CREATE TABLE alert_configs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id        UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_type     alert_type NOT NULL,
  is_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  threshold      NUMERIC(10,4),
  threshold_unit TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(farm_id, alert_type)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id      UUID REFERENCES farms(id),
  user_id      UUID REFERENCES auth.users(id),
  action       TEXT NOT NULL,
  table_name   TEXT NOT NULL,
  record_id    UUID,
  old_values   JSONB,
  new_values   JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','farms','poultry_houses','flocks','flock_population',
    'daily_production','feed_inventory','feed_consumption','health_events',
    'morbidity_records','mortality_records','vaccinations','medications',
    'culling_records','expenses','sales','inventory_items','alert_configs'
  ] LOOP
    EXECUTE format('
      CREATE TRIGGER trg_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', t);
  END LOOP;
END;
$$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_flocks_farm ON flocks(farm_id);
CREATE INDEX idx_flocks_status ON flocks(status);
CREATE INDEX idx_daily_production_flock_date ON daily_production(flock_id, record_date DESC);
CREATE INDEX idx_daily_production_farm_date ON daily_production(farm_id, record_date DESC);
CREATE INDEX idx_morbidity_flock_date ON morbidity_records(flock_id, record_date DESC);
CREATE INDEX idx_morbidity_farm_date ON morbidity_records(farm_id, record_date DESC);
CREATE INDEX idx_morbidity_resolved ON morbidity_records(is_resolved);
CREATE INDEX idx_mortality_flock_date ON mortality_records(flock_id, record_date DESC);
CREATE INDEX idx_mortality_farm_date ON mortality_records(farm_id, record_date DESC);
CREATE INDEX idx_feed_consumption_flock_date ON feed_consumption(flock_id, record_date DESC);
CREATE INDEX idx_expenses_farm_date ON expenses(farm_id, expense_date DESC);
CREATE INDEX idx_sales_farm_date ON sales(farm_id, sale_date DESC);
CREATE INDEX idx_alerts_farm_unread ON alerts(farm_id, is_read);
CREATE INDEX idx_audit_logs_farm ON audit_logs(farm_id, created_at DESC);
